import Map from "./components/Map/Map";
import Navbar from "./components/Navbar/Navbar";

export default function Home() {
  return (
    <main className="flex px-52 bg-yellow-400">
      <Navbar />
      <Map />
    </main>
  );
}
