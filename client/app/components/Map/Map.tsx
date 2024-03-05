"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

import WorldJSON from "./world.json";
import { MdFilterCenterFocus } from "react-icons/md";

export default function Map() {
  const [tooltipContent, setTooltipContent] = useState("Not hovering");
  const [position, setPosition] = useState({
    coordinates: [0, 0] as [number, number],
    zoom: 1,
  });

  // country ids for testing
  // TODO: when users is created, get signed in users visitedCountries list
  const visitedCountries: string[] = ["840", "398", "834", "242"];

  const setVisitedCountries = (visitedCountries: string[]) => {
    if (!visitedCountries) return;

    visitedCountries.forEach((visitedId) => {
      WorldJSON.objects.countries.geometries.forEach((country) => {
        if (country.id === visitedId) {
          country.properties.visited = true;
        }
      });
    });
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  const centerMap = () => {
    let centerPosition = {
      coordinates: [0, 0] as [number, number],
      zoom: 1,
    };
    setPosition(centerPosition);
  };

  setVisitedCountries(visitedCountries);

  return (
    // <div className="w-full h-[92vh] flex flex-col justify-center items-center">
    // <h3>{tooltipContent}</h3>
    <div className="w-full max-w-screen max-h-[92vh] overflow-hidden bg-slate-700">
      <ComposableMap projection="geoMercator">
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={WorldJSON}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    const { name } = geo.properties;
                    setTooltipContent(`${name}`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("Not hovering");
                  }}
                  className={`hover:fill-red-200 outline-none ${
                    geo.properties.visited ? "fill-red-500" : "fill-red-300"
                  }`}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {/* RECENTER BUTTON */}
      <MdFilterCenterFocus
        className="fixed right-4 bottom-4 text-4xl cursor-pointer"
        onClick={centerMap}
      />
    </div>
    // </div>
  );
}
