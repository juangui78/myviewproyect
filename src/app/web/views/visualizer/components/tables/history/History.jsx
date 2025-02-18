import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell, getKeyValue} from "@heroui/table";

  
  const rows = [
    {
      key: "1",
      name: "Parcela Esteban",
      date: "...",
      
    },
    
    
  ];
  
  const columns = [
    {
      key: "name",
      label: "Nombre",
    },
    {
        key: "date",
        label: "Fecha",
    },
   
    
  ];
  
  export default function App() {
    return (
      
      <Table aria-label="Example table with dynamic content" className="py-4 dark" isCompact>
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={rows} className="text-xs text-white">
          {(item) => (
            <TableRow key={item.key} className="text-xs text-white">
              {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
      
    );
  }