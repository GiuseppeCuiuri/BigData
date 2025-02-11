package com.example

import org.apache.spark.sql.{SparkSession, DataFrame}
import org.apache.spark.sql.functions._

object FlightCoordinates {

  // Crea una sessione Spark
  val spark = SparkSession.builder()
    .appName("Flight Coordinates Join")
    .config("spark.master", "local")
    .getOrCreate()

  // Funzione per caricare e formattare il dataset degli aeroporti
  def loadAirportCoordinates(filePath: String): DataFrame = {
    // Carica il file .txt
    val rawDF = spark.read
      .option("delimiter", ",")
      .option("quote", "\"")
      .option("header", "false")
      .csv(filePath)
      .toDF("index", "airport_name", "city", "country", "iata_code", "icao_code", "latitude", "longitude", "altitude", "timezone_offset", "legal_hour", "timezone", "type", "source")

    // Seleziona solo le colonne necessarie
    rawDF.select("iata_code", "latitude", "longitude")
  }

  // Funzione per caricare il dataset dei voli
  def loadFlightData(filePath: String): DataFrame = {
    // Carica il dataset dei voli e seleziona solo le colonne desiderate
    spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(filePath)
      .select("Origin", "OriginCityName", "Dest", "DestCityName")
  }


  // Funzione per fare la join dei dati
  def joinFlightsWithCoordinates(flightsDF: DataFrame, airportCoordinatesDF: DataFrame): DataFrame = {
    val airportCoordinatesWithOrigin = airportCoordinatesDF.withColumnRenamed("iata_code", "Origin_code")
    val airportCoordinatesWithDest = airportCoordinatesDF.withColumnRenamed("iata_code", "Dest_code")

    // Join per ottenere le coordinate dell'origine
    val flightsWithOriginCoordinates = flightsDF
      .join(airportCoordinatesWithOrigin, flightsDF("Origin") === airportCoordinatesWithOrigin("Origin_code"), "left")
      .select(
        flightsDF("Origin"),
        flightsDF("OriginCityName"),
        flightsDF("Dest"),
        flightsDF("DestCityName"),
        airportCoordinatesWithOrigin("latitude").alias("origin_latitude"),
        airportCoordinatesWithOrigin("longitude").alias("origin_longitude")
      )

    // Join per ottenere le coordinate della destinazione
    flightsWithOriginCoordinates
      .join(airportCoordinatesWithDest, flightsWithOriginCoordinates("Dest") === airportCoordinatesWithDest("Dest_code"), "left")
      .select(
        flightsWithOriginCoordinates("Origin"),
        flightsWithOriginCoordinates("OriginCityName"),
        flightsWithOriginCoordinates("origin_latitude"),
        flightsWithOriginCoordinates("origin_longitude"),
        flightsWithOriginCoordinates("Dest"),
        flightsWithOriginCoordinates("DestCityName"),
        airportCoordinatesWithDest("latitude").alias("dest_latitude"),
        airportCoordinatesWithDest("longitude").alias("dest_longitude")
      )
  }

  // Funzione principale per caricare i dati, fare la join e salvare il risultato
  def main(args: Array[String]): Unit = {
    val airportFilePath = "C:\\Users\\giuse\\Desktop\\airports.txt"
    val flightsFilePath = "C:\\Users\\giuse\\Desktop\\Voli_aerei\\merged\\dataset.csv"

    // Carica i dati degli aeroporti e dei voli
    val airportCoordinatesDF = loadAirportCoordinates(airportFilePath)
    val flightsDF = loadFlightData(flightsFilePath)

    //join
    val resultDF = joinFlightsWithCoordinates(flightsDF, airportCoordinatesDF)

    // Visualizza i primi risultati
    resultDF.show()

    //DataFrame in JSON
    val jsonRDD = resultDF.distinct().toJSON

    // Salvataggio dati come JSON
    val outputPath = "C:\\Users\\giuse\\Desktop\\Voli_aerei\\merged\\coordinates_json"

    // JSON come un singolo array
    val jsonArray = jsonRDD.collect().mkString("[", ",", "]")

    // Salvataggio
    import java.nio.file.{Files, Paths}
    Files.write(Paths.get(outputPath + ".json"), jsonArray.getBytes)

    println(s"File JSON salvato in: $outputPath.json")
  }

}
