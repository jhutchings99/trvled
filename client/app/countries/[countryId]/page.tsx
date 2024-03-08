import Navbar from "../../components/Navbar/Navbar";

interface Params {
  countryId: number;
}

export default function CountryPage({ params }: { params: Params }) {
  return (
    <main className="flex px-52">
      <Navbar />
      <p>Country {params.countryId}</p>
    </main>
  );
}
