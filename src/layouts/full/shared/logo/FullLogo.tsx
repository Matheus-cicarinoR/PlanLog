

import { Tractor } from 'lucide-react';
import { Link } from "react-router";
const FullLogo = () => {
  return (
    <Link to={"/"} className="flex items-center gap-2">
      <Tractor className="w-8 h-8 text-primary" />
      <span className="text-xl font-bold">PlanLog</span>
    </Link>
  );
};

export default FullLogo;
