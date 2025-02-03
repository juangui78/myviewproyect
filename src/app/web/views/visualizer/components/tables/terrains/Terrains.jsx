import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell, getKeyValue} from "@heroui/table";

  
  const rows = [
    {
      key: "1",
      name: "Parcela Esteban",
      role: "6h",
      
    },
    {
      key: "2",
      name: "Terreno Industrial",
      role: "8h",
      
    },
    
  ];
  
  const columns = [
    {
      key: "name",
      label: "Nombre",
    },
    {
      key: "role",
      label: "Area",
    },
    
  ];
  
  export default function App() {
    return (
      <Table aria-label="Example table with dynamic content" className="py-4">
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={rows} className="text-xs">
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  }
  