-- AlterTable
CREATE EXTENSION postgis;

ALTER TABLE
  "Workshop"
ADD
  COLUMN geolocation GEOGRAPHY(POINT) NOT NULL;
