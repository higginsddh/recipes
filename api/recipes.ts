export default async function handler(request, response) {
  const recipes = [
    {
      id: "1",
      title: "Carne asado tacos",
      notes: "Test notes",
      tags: [],
      img: null,
    },
  ];

  const data = { recipes };
  return response.status(200).json(data);
}
