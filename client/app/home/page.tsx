import Navbar from "../components/Navbar/Navbar";
import SocialFeed from "../components/SocialFeed/SocialFeed";

export default function Home() {
  return (
    <main className="flex px-52">
      <Navbar />
      <SocialFeed />
    </main>
  );
}
