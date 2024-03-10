import Navbar from "./components/Navbar/Navbar";
import Component from "./components/Testing/test";

export default function Home() {
  return (
    <main className="flex px-52">
      <Navbar />
      <Component />
      <p>Home</p>
    </main>
  );
}
