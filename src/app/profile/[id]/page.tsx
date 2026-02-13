export default async function UserProfile({ params }: any) {

    const paramsId = await  params;
  console.log(paramsId.id);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>

      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="absolute -bottom-10 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000"></div>
      <h1 className="">Profile </h1>
      <p className="text-4xl">Profile Page </p>
      <span className="p-2 ml-2 rounded-2xl bg-orange-400">{paramsId.id}</span>
    </div>
  );
  
}
