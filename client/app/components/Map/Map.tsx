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
import { useSession } from "next-auth/react";

export default function Map() {
  const router = useRouter();
  let { data: session } = useSession();
  const [position, setPosition] = useState({
    coordinates: [0, 0] as [number, number],
    zoom: 1,
  });

  const setVisitedCountries = (visitedCountries: string[]) => {
    if (!session?.user.globalVisited) return;

    session?.user.globalVisited.forEach((visitedId) => {
      WorldJSON.objects.countries.geometries.forEach((country) => {
        if (country.id === visitedId.toString()) {
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

  return (
    <div className="w-[55vw]  overflow-hidden relative border-r-[1px] border-black">
      <ComposableMap projection="geoMercator" className="h-screen w-[55vw]">
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
                  onClick={() => {
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
  );
}
