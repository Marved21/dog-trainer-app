import ClientList from "./components/ClientList"
import AddClientForm from "./components/AddClientForm"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Client Dashboard</h2>
      </div>
      <AddClientForm />
      <ClientList />
    </div>
  )
}

