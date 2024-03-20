import Link from "next/link";
import Logo from "../../../public/logo.svg";
import ProfilePic from "../../../public/temp-fake-profile-img.jpg";
import Image from "next/image";
import {
  MdMap,
  MdHome,
  MdOutlineSearch,
  MdOutlineListAlt,
  MdWorkspaces,
} from "react-icons/md";

export default function Navbar() {
  return (
    <div className="w-[20vw] h-screen flex flex-col justify-between py-12 px-4 border-r-[1px] border-l-[1px] border-black">
      <div>
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="trvled logo" className="w-9" />
          <Link
            className="text-primary font-black uppercase text-4xl"
            href={"/"}
          >
            trveld
          </Link>
        </div>
        <div className="flex flex-col gap-6 pt-8">
          <div className="flex items-center gap-2">
            <MdHome className="h-10 w-10" />
            <Link className="uppercase font-medium text-2xl" href={"/"}>
              Home
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <MdMap className="h-10 w-10" />
            <Link className="uppercase font-medium text-2xl" href={"/map"}>
              Map
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineSearch className="h-10 w-10" />
            <Link className="uppercase font-medium text-2xl" href={"/explore"}>
              Explore
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineListAlt className="h-10 w-10" />
            <Link className="uppercase font-medium text-2xl" href={"/planner"}>
              Planner
            </Link>
          </div>
        </div>
      </div>
      <Link className="w-64" href={"/profile"}>
        <div className="flex justify-between px-6 py-2 rounded-full items-center hover:bg-slate-200">
          <div className="flex gap-2">
            <Image
              src={ProfilePic}
              alt="fake profile pic for testing"
              className="h-12 w-12 rounded-full"
            />
            <div>
              <p>Username</p>
              <p>@Username</p>
            </div>
          </div>
          <MdWorkspaces className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
