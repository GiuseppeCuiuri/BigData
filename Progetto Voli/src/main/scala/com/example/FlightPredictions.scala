package com.example

import org.apache.spark.ml.Pipeline
import org.apache.spark.ml.evaluation.RegressionEvaluator
import org.apache.spark.ml.feature.VectorAssembler
import org.apache.spark.ml.regression.LinearRegression
import org.apache.spark.sql.functions.monotonically_increasing_id
import org.apache.spark.sql.{DataFrame, SparkSession}

import java.nio.file.{Files, Paths}

class FlightPredictions(spark: SparkSession, filePath: String) {

  // Caricamento del dataset
  private val df: DataFrame = spark.read
    .option("header", "true")
    .option("inferSchema", "true")
    .csv(filePath)

  var data: DataFrame = df.na.fill(Map("DepDelay" -> 0.0, "AirTime" -> 0.0, "DepDelayMinutes" -> 0.0, "Distance" -> 0.0))

  // Creazione del feature vector con DepDelay e AirTime
  private val assembler = new VectorAssembler()
    .setInputCols(Array("DepDelay", "AirTime", "DepDelayMinutes", "Distance"))
    .setOutputCol("features")

  private val assemblerOutput = assembler.transform(data)  // Crea le features

  // Creazione del modello LinearRegression
  private val lr = new LinearRegression()
    .setFeaturesCol("features")
    .setLabelCol("ArrDelay")

  // Creazione del pipeline (con solo il LinearRegression)
  private val pipeline = new Pipeline().setStages(Array(
    lr
  ))

  // Suddivisione del dataset in training (80%) e test (20%)
  private val Array(trainingData, testData) = assemblerOutput.randomSplit(Array(0.8, 0.2))

  // Allenamento del modello
  private val model = pipeline.fit(trainingData)

  // Test del modello
  private val predictions = model.transform(testData)

  private val evaluator = new RegressionEvaluator()
    .setLabelCol("ArrDelay")
    .setPredictionCol("prediction")
    .setMetricName("rmse")

  private val rmse = evaluator.evaluate(predictions)
  println(s"Root Mean Squared Error (RMSE) on test data = $rmse")

  // Mostra i risultati delle predizioni su dati di test
  def showPredictions(): Unit = {
    predictions.select("ArrDelay", "prediction").show(10)
  }

  // Salva tutte le predizioni in un singolo file JSON
  def savePredictionsToJSON(outputPath: String): Unit = {
    val validRoutes = data.select("Origin", "Dest").distinct()
      .withColumnRenamed("Origin", "Origin_validRoutes")
      .withColumnRenamed("Dest", "Dest_validRoutes")

    val testDataIndexed = testData.withColumn("idx", monotonically_increasing_id())
    val predictionsIndexed = predictions.withColumn("idx", monotonically_increasing_id())

    val predictionsWithRoutes = testDataIndexed
      .join(predictionsIndexed, Seq("idx"), "inner")
      .drop("idx") // Rimuove la colonna temporanea dopo il join

    // Alias per evitare ambiguità nelle colonne
    val validRoutesAlias = validRoutes.as("vr")
    val predictionsWithRoutesAlias = predictionsWithRoutes.as("pwr")
    val testDataAlias = testData.as("td")

    val predictionsToSave = predictionsWithRoutesAlias
      .join(validRoutesAlias,
        testDataAlias("Origin") === validRoutesAlias("Origin_validRoutes") &&
          testDataAlias("Dest") === validRoutesAlias("Dest_validRoutes"),
        "inner")
      .select(
        testDataAlias("Origin"),
        testDataAlias("Dest"),
        testDataAlias("OriginCityName"),
        testDataAlias("DestCityName"),
        predictionsWithRoutesAlias("prediction")
      )

    // Converti il DataFrame in un RDD di JSON e raccogli
    val jsonRDD = predictionsToSave.toJSON

    // Unisci tutti gli oggetti JSON in un singolo array JSON
    val jsonString = jsonRDD.collect().mkString("[", ",", "]")

    // Salva il JSON in un unico file
    Files.write(Paths.get(outputPath), jsonString.getBytes("UTF-8"))

    println(s"Predictions saved as a single JSON array to: $outputPath")

  }
}

object FlightPredictionApp {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("FlightDelayPrediction")
      .master("local[*]")  // Usa il master locale per il test
      .getOrCreate()

    val predictor = new FlightPredictions(spark, "C:/Users/giuse/Desktop/Voli_aerei/merged/dataset.csv")

    // Mostrare alcune predizioni
    predictor.showPredictions()

    // Salvare le predizioni in un singolo file JSON
    val outputPath = "C:/Users/giuse/Desktop/predictions.json"  // Modifica il percorso di output come desiderato
    predictor.savePredictionsToJSON(outputPath)
  }
}
