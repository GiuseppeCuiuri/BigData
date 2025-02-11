package com.example

import org.apache.spark.sql.{SparkSession, DataFrame}

object MergeCSV {
  def main(args: Array[String]): Unit = {

    val inputPath = "C:\\Users\\giuse\\Desktop\\Voli_aerei"
    val outputPath = "C:\\Users\\giuse\\Desktop\\Voli_aerei\\merged"

    val spark = SparkSession.builder()
      .appName("Merge CSV Files")
      .master("local[*]")  // Usa modalità locale
      .getOrCreate()

    // Legge tutti i file CSV nella cartella inputPath
    val df: DataFrame = spark.read
      .option("header", "true")
      .option("inferSchema", "true")
      .csv(inputPath + "/*.csv")

    // Salva il DataFrame unito in outputPath
    df.coalesce(1) // Unisce in un unico file
      .write
      .option("header", "true")
      .csv(outputPath)

    spark.stop()
  }
}

