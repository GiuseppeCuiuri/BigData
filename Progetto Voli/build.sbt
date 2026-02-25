ThisBuild / scalaVersion := "2.12.18"
ThisBuild / version := "0.1"

lazy val root = (project in file("."))
  .settings(
    name := "Progetto Voli",
    libraryDependencies ++= Seq(
      "org.apache.spark" %% "spark-core" % "3.4.4",
      "org.apache.spark" %% "spark-sql" % "3.4.4",
      "org.apache.spark" %% "spark-mllib" % "3.4.4",
      "com.typesafe.akka" %% "akka-actor-typed" % "2.8.0",
      "com.typesafe.akka" %% "akka-stream" % "2.8.0",
      "com.typesafe.akka" %% "akka-http" % "10.5.2",
      "io.spray" %% "spray-json" % "1.3.6",
      "com.typesafe.akka" %% "akka-http-spray-json" % "10.5.2",
      "com.typesafe.akka" %% "akka-http-core" % "10.5.2",
      "com.typesafe.akka" %% "akka-actor" % "2.8.0",
      "ch.qos.logback" % "logback-classic" % "1.4.11"
    ),


      dependencyOverrides += "org.scala-lang.modules" %% "scala-parser-combinators" % "2.1.1"

  )