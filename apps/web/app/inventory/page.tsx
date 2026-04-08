import { Badge } from "../../components/ui/badge";

const inventoryItems = [
  { id: "1", name: "Projector Epson-01", status: "In Use", borrower: "IT Dept" },
  { id: "2", name: "Wireless Mic System", status: "Available", borrower: "-" },
];

export default function InventoryPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Equipment Inventory</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Item Name</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Current Holder</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4">
                  <Badge variant={item.status === "Available" ? "outline" : "secondary"}>
                    {item.status}
                  </Badge>
                </td>
                <td className="p-4 text-slate-500">{item.borrower}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}