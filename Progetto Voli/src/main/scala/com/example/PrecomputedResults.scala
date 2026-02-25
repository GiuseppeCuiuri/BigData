package com.example

import java.nio.file.{Files, Paths}
import java.nio.charset.StandardCharsets

object PrecomputedResults {
  private val resultsPath = "C:/Users/giuse/Desktop/Voli_aerei/merged/results"

  def loadJson(fileName: String): String = {
    val filePath = s"$resultsPath/$fileName"
    if (Files.exists(Paths.get(filePath))) {
      new String(Files.readAllBytes(Paths.get(filePath)), StandardCharsets.UTF_8)
    } else {
      FlightDataPreprocessor.generateAll()
      loadJson(fileName)
    }
  }

  val countPerMonthJson: String = loadJson("count_per_month.json")
  val datasetDimensionsJson: String = loadJson("dataset_dimensions.json")
  val mostTravelsAirplaneJson: String = loadJson("most_travels_airplane.json")
  val flightsPerAirlineJson: String = loadJson("flights_per_airline.json")
  val routesAverageDelayJson: String = loadJson("routes_average_delay.json")
  val delayPercentagePerMonthJson: String = loadJson("delay_percentage_per_month.json")
  val averageFlightsPerAirlineJson: String = loadJson("average_flights_per_airline.json")
  val averageFlightTimeJson: String = loadJson("average_flight_time.json")
  val cancellationRatePerAirlineJson: String = loadJson("cancellation_rate_per_airline.json")
  val routesNumberDelayJson: String = loadJson("routes_number_delay.json")
  val routesNumberDivertedJson: String = loadJson("routes_number_diverted.json")
  val routesNumberReachedJson: String = loadJson("routes_number_reached.json")
  val deviatedLandingsNumberJson: String = loadJson("deviated_landings_number.json")
  val reasonsDelayAverageJson: String = loadJson("reasons_delay_average.json")
  val flightTravelsJson: String = loadJson("flight_travels.json")
  val routeDistancesJson: String = loadJson("route_distances.json")
  val airportsCoordinatesJson: String = loadJson("../coordinates.json")
  val delayPredictionsJson: String = loadJson("../predictions2.json")
}
