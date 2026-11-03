import { redirect } from "next/navigation";

// Product management is the first area of the app; the overview page
// follows once there are customers and licenses.
export default function Home() {
  redirect("/produkte");
}
