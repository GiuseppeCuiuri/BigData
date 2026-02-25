package com.example

import akka.http.scaladsl.model.HttpMethods.{GET, OPTIONS, POST}
import akka.http.scaladsl.model.headers.{`Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Origin`}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

object FlightControllerAKKA {

  // Middleware CORS
  private def corsHandler(route: Route): Route = {
    respondWithHeaders(
      `Access-Control-Allow-Origin`.*,
      `Access-Control-Allow-Methods`(GET, POST, OPTIONS),
      `Access-Control-Allow-Headers`("Content-Type")
    ) {
      route
    }
  }

  val route: Route = corsHandler(
    pathPrefix("api" / "flights") {
      concat(
        path("count-per-month") {
          get {
            complete(PrecomputedResults.countPerMonthJson)
          }
        },
        path("dataset-dimensions") {
          get {
            complete(PrecomputedResults.datasetDimensionsJson)
          }
        },
        path("most-travels-airplane") {
          get {
            complete(PrecomputedResults.mostTravelsAirplaneJson)
          }
        },
        path("flights-per-airline") {
          get {
            complete(PrecomputedResults.flightsPerAirlineJson)
          }
        },
        path("routes-average-delay") {
          get {
            complete(PrecomputedResults.routesAverageDelayJson)
          }
        },
        path("delay-percentage-per-month") {
          get {
            complete(PrecomputedResults.delayPercentagePerMonthJson)
          }
        },
        path("average-flights-per-airline") {
          get {
            complete(PrecomputedResults.averageFlightsPerAirlineJson)
          }
        },
        path("average-flight-time") {
          get {
            complete(PrecomputedResults.averageFlightTimeJson)
          }
        },
        path("cancellation-rate-per-airline") {
          get {
            complete(PrecomputedResults.cancellationRatePerAirlineJson)
          }
        },
        path("routes-number-delay") {
          get {
            complete(PrecomputedResults.routesNumberDelayJson)
          }
        },
        path("routes-number-diverted") {
          get {
            complete(PrecomputedResults.routesNumberDivertedJson)
          }
        },
        path("routes-number-reached") {
          get {
            complete(PrecomputedResults.routesNumberReachedJson)
          }
        },
        path("deviated-landings-number") {
          get {
            complete(PrecomputedResults.deviatedLandingsNumberJson)
          }
        },
        path("reasons-delay-average") {
          get {
            complete(PrecomputedResults.reasonsDelayAverageJson)
          }
        },
        path("flight-travels") {
          get {
            complete(PrecomputedResults.flightTravelsJson)
          }
        },
        path("route-distances") {
          get {
            complete(PrecomputedResults.routeDistancesJson)
          }
        },
        path("airports-coordinates") {
          get {
            complete(PrecomputedResults.airportsCoordinatesJson)
          }
        },
        path("delay-predictions") {
          get {
            complete(PrecomputedResults.delayPredictionsJson)
          }
        }
      )
    }
  )
}
