"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
    <div className="w-full  overflow-hidden relative border-r-[1px] border-black">
      <ComposableMap projection="geoMercator" className="h-screen w-full">
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
                  // onMouseEnter={() => {
                  //   const { name } = geo.properties;
                  //   setTooltipContent(`${name}`);
                  // }}
                  // onMouseLeave={() => {
                  //   setTooltipContent("Not hovering");
                  // }}
                  onClick={() => {
                    console.log(geo);
                    router.push(`/countries/${geo.id}`);
                  }}
                  className={`hover:fill-hover stroke-black outline-none ${
                    geo.properties.visited ? "fill-primary" : "fill-secondary"
                  }`}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {/* RECENTER BUTTON */}
      <MdFilterCenterFocus
        className="absolute right-8 bottom-8 text-4xl cursor-pointer"
        onClick={centerMap}
      />
    </div>
    // </div>
  );
}
