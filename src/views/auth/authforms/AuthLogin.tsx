import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Link, useNavigate } from "react-router";



const AuthLogin = () => {
 const navigate = useNavigate();
 const handleSubmit = (event:React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  console.log(event);
   navigate("/");
 }
 return (
  <>
   <form onSubmit={handleSubmit} >
    <div className="mb-4">
     <div className="mb-2 block">
      <Label htmlFor="Username">Username</Label>
     </div>
     <Input
      id="Username"
      type="text"
      required
      className="form-control form-rounded-xl"
     />
    </div>
    <div className="mb-4">
     <div className="mb-2 block">
      <Label htmlFor="userpwd">Password</Label>
     </div>
     <Input
      id="userpwd"
      type="password"
      required
      className="form-control form-rounded-xl"
     />
    </div>
    <div className="flex justify-between my-5">
     <div className="flex items-center gap-2">
      <Checkbox id="accept" className="checkbox" />
      <Label
       htmlFor="accept"
       className="opacity-90 font-normal cursor-pointer"
      >
       Remeber this Device
      </Label>
     </div>
     <Link to={"/"} className="text-primary text-sm font-medium">
      Forgot Password ?
     </Link>
    </div>
    <Button type="submit" className="w-full bg-primary text-slate-900 hover:bg-primary/90 rounded-xl">
     Sign in
    </Button>
   </form>
  </>
 );
};

export default AuthLogin;
