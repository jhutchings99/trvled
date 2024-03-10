"use server";

import Navbar from "../../components/Navbar/Navbar";
import { useAppSelector } from "../../store/hooks";
import { countryIdToName } from "@/app/helpers/countryIdToName";

interface Params {
  countryId: number;
  countryName: string;
}

export default async function CountryPage({ params }: { params: Params }) {
  const countryName = countryIdToName[String(params.countryId)];

  //   console.log(selectedCountry);
  return (
    <main className="flex px-52">
      <Navbar />
      <p>Country: {countryName}</p>
    </main>
  );
}
