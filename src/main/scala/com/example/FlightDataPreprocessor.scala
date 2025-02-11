package com.example

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._
import spray.json._
import java.nio.file.{Files, Paths}
import java.nio.charset.StandardCharsets

object FlightDataPreprocessor extends JsonSupport {

  val spark: SparkSession = SparkSession.builder()
    .appName("Flight API Preprocessor")
    .master("local[*]")
    .config("spark.sql.catalogImplementation", "in-memory")
    .config("spark.hadoop.security.authentication", "none")
    .getOrCreate()

  val df: DataFrame = spark.read.option("header", "true").option("inferSchema", "true")
    .csv("C:/Users/giuse/Desktop/Voli_aerei/merged/dataset.csv")
    .cache()

  def saveJson(filename: String, data: String): Unit = {
    Files.write(Paths.get(s"C:/Users/giuse/Desktop/Voli_aerei/merged/results/$filename"), data.getBytes(StandardCharsets.UTF_8))
  }

  def generateAll(): Unit = {
    val countPerMonthJson = df.groupBy("Month").count().toJSON.collect().mkString("[", ",", "]")
    saveJson("count_per_month.json", countPerMonthJson)

    val datasetDimensionsJson = Map("rows" -> df.count().toInt, "columns" -> df.columns.length).toJson.toString()
    saveJson("dataset_dimensions.json", datasetDimensionsJson)

    val mostTravelsAirplaneJson = df.na.drop(Seq("Tail_Number"))
      .groupBy("Tail_Number").count()
      .orderBy(desc("count"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("most_travels_airplane.json", mostTravelsAirplaneJson)

    val flightPerAirlines = df.groupBy("Reporting_Airline")
      .count()
      .orderBy(desc("count"))
      .withColumnRenamed("count", "TotalFlights")
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("flights_per_airline.json", flightPerAirlines)

    val routesAverageDelayJson = df.groupBy("Origin", "Dest", "OriginCityName", "DestCityName")
      .agg(avg("ArrDelay").alias("Delay"))
      .orderBy(desc("Delay"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("routes_average_delay.json", routesAverageDelayJson)

    val delayPercentagePerMonthJson = df.groupBy("Month")
      .agg((count(when(col("ArrDelayMinutes") > 0, true)) / count("*") * 100).alias("DelayPercentage"))
      .orderBy("Month")
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("delay_percentage_per_month.json", delayPercentagePerMonthJson)

    val averageFlightsPerAirlineJson = df.groupBy("Reporting_Airline", "FlightDate")
      .count()
      .groupBy("Reporting_Airline")
      .agg(avg("count").alias("AverageDailyFlights"))
      .orderBy(desc("AverageDailyFlights"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("average_flights_per_airline.json", averageFlightsPerAirlineJson)

    val averageFlightTimeJson = df.groupBy("Origin", "Dest")
      .agg(avg("AirTime").alias("AverageFlightTime"))
      .orderBy(desc("AverageFlightTime"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("average_flight_time.json", averageFlightTimeJson)

    val cancellationRatePerAirlineJson = df.groupBy("Reporting_Airline")
      .agg((count(when(col("Cancelled") === 1, true)) / count("*") * 100).alias("CancellationRate"))
      .orderBy(desc("CancellationRate"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("cancellation_rate_per_airline.json", cancellationRatePerAirlineJson)

    val routesNumberDelayJson = df.groupBy("Origin", "Dest", "OriginCityName", "DestCityName")
      .agg(
        count(when(col("ArrDelayMinutes") > 0, 1)).alias("Delay"),
        count(col("ArrDelayMinutes")).alias("Total"),
        round(count(when(col("ArrDelayMinutes") > 0, 1)) / count(col("ArrDelayMinutes")) * 100, 2).alias("Percentage")
      )
      .orderBy(desc("Percentage"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("routes_number_delay.json", routesNumberDelayJson)

    val routesNumberDivertedJson = df.groupBy("Origin", "Dest", "OriginCityName", "DestCityName")
      .agg(
        count(when(col("Diverted") === "1.00", 1)).alias("Diverted"),
        count(col("Diverted")).alias("Total"),
        count(when(col("DivReachedDest") === "1.00", 1)).alias("DivReachedDest"),
        round(count(when(col("Diverted") === "1.00", 1)) / count(col("Diverted")) * 100, 2).alias("Percentage")
      )
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("routes_number_diverted.json", routesNumberDivertedJson)

    val routesNumberReachedJson = df.agg(
      count(when(col("Diverted") === "1.00", 1)).alias("Diverted"),
      count(col("Diverted")).alias("Total"),
      count(when(col("DivReachedDest") === "1.00", 1)).alias("DivReachedDest")
    )
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("routes_number_reached.json", routesNumberReachedJson)

    val deviatedLandingsNumberJson = df.filter(col("DivAirportLandings") =!= 0)
      .groupBy("DivAirportLandings")
      .count()
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("deviated_landings_number.json", deviatedLandingsNumberJson)

    val total = df.filter(col("CarrierDelay") >= 0).count().toDouble

    val reasonsDelayAverageJson = df.agg(
        struct(
          round(avg("CarrierDelay"), 2).alias("Carrier delay"),
          round(count(when(col("CarrierDelay") > 0, 1)) / total * 100, 2).alias("Percentage")
        ).alias("Carrier"),

        struct(
          round(avg("WeatherDelay"), 2).alias("Weather delay"),
          round(count(when(col("WeatherDelay") > 0, 1)) / total * 100, 2).alias("Percentage")
        ).alias("Weather"),

        struct(
          round(avg("NASDelay"), 2).alias("NAS delay"),
          round(count(when(col("NASDelay") > 0, 1)) / total * 100, 2).alias("Percentage")
        ).alias("NAS"),

        struct(
          round(avg("SecurityDelay"), 2).alias("Security delay"),
          round(count(when(col("SecurityDelay") > 0, 1)) / total * 100, 2).alias("Percentage")
        ).alias("Security"),

        struct(
          round(avg("LateAircraftDelay"), 2).alias("Late Aircraft delay"),
          round(count(when(col("LateAircraftDelay") > 0, 1)) / total * 100, 2).alias("Percentage")
        ).alias("LateAircraft")
      )
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("reasons_delay_average.json", reasonsDelayAverageJson)

    val flightTravelsJson = df.groupBy("Origin", "Dest", "OriginCityName", "DestCityName")
      .count()
      .orderBy(desc("count"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("flight_travels.json", flightTravelsJson)

    val routeDistancesJson = df.groupBy("Origin", "Dest", "OriginCityName", "DestCityName")
      .agg(max("Distance").alias("Distance"))
      .orderBy(desc("Distance"))
      .toJSON.collect().mkString("[", ",", "]")
    saveJson("route_distances.json", routeDistancesJson)

}

  def main(args: Array[String]): Unit = {
    generateAll()
  }
}

trait JsonSupport extends DefaultJsonProtocol {
  implicit val mapFormat: RootJsonFormat[Map[String, Int]] = new RootJsonFormat[Map[String, Int]] {
    def write(map: Map[String, Int]): JsValue = JsObject(map.map {
      case (key, value) => key -> JsNumber(value)
    }.toSeq: _*)

    def read(value: JsValue): Map[String, Int] = value match {
      case JsObject(fields) =>
        fields.map {
          case (key, JsNumber(value)) => key -> value.toInt
          case _ => throw new DeserializationException("Expected JsNumber for value")
        }
      case _ => throw new DeserializationException("Expected JsObject")
    }
  }
}