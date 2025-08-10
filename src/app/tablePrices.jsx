"use client";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

const TablePrices = () => {
  return (
    <section className="w-full bg-white rounded-lg p-3 ">
      <table className="w-[100%] bg-white rounded-lg">
        <thead className="rounded-lg bg-gray-200">
          <tr>
            <th className="text-black p-3 border-b">Plan</th>
            <th className="text-black p-3 border-b">Actualización</th>
            <th className="text-black p-3 border-b">Calidad</th>
            <th className="text-black p-3 border-b">Área</th>
            <th className="text-black p-3 border-b">Pauta digital</th>
            <th className="text-black p-3 border-b">Alcance</th>
            <th className="text-black p-3 border-b">Visitas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center text-black p-3 border-b">Static</td>
            <td className="text-center text-black p-3 border-b">---</td>
            <td className="text-center text-black p-3 border-b">250.000 vertices</td>
            <td className="text-center text-black p-3 border-b">500m² - 50.000m²</td>
            <td className="text-center text-black p-3 border-b">No</td>
            <td className="text-center text-black p-3 border-b">---</td>
            <td className="text-center text-black p-3 border-b">---</td>
          </tr>
          <tr>
            <td className="text-center text-black p-3 border-b">Basic</td>
            <td className="text-center text-black p-3 border-b">2 cada 2 meses</td>
            <td className="text-center text-black p-3 border-b">250.000 vertices</td>
            <td className="text-center text-black p-3 border-b">500m² - 50.000m²</td>
            <td className="text-center text-black p-3 border-b">No</td>
            <td className="text-center text-black p-3 border-b">---</td>
            <td className="text-center text-black p-3 border-b">---</td>
          </tr>
          <tr>
            <td className="text-center text-black p-3 border-b">Plus</td>
            <td className="text-center text-black p-3 border-b">2 cada 2 meses</td>
            <td className="text-center text-black p-3 border-b">500.000 vertices</td>
            <td className="text-center text-black p-3 border-b">50.000m² - 100.000m²</td>
            <td className="text-center text-black p-3 border-b">Si</td>
            <td className="text-center text-black p-3 border-b">250.000 vistas</td>
            <td className="text-center text-black p-3 border-b">9.500 vistas al modelo</td>
          </tr>
          <tr>
            <td className="text-center text-black p-3 border-b">Pro</td>
            <td className="text-center text-black p-3 border-b">2 cada 2 meses</td>
            <td className="text-center text-black p-3 border-b">750.000 vertices</td>
            <td className="text-center text-black p-3 border-b">100.000m² - 200.000m²</td>
            <td className="text-center text-black p-3 border-b">Si</td>
            <td className="text-center text-black p-3 border-b">330.000 vistas</td>
            <td className="text-center text-black p-3 border-b">12.000 vistas al modelo</td>
          </tr>
      
        </tbody>
      </table>
    </section>

    // <Table  isCompact aria-label="Example static collection table" classNames={{
    //     table: "border border-gray-300 w-full",
    //     tr: " border border-gray-300",
    //     td: "p-3",
    //     th: "border-b-inherit ",
    // }}>
    //   <TableHeader>
    //     <TableColumn className="text-center text-base text-black">Plan</TableColumn>
    //     <TableColumn className="text-center text-base text-black">Actualización</TableColumn>
    //     <TableColumn className="text-center text-base text-black">Calidad</TableColumn>
    //     <TableColumn className="text-center text-base text-black">Área</TableColumn>
    //     <TableColumn className="text-center text-base text-black">Pauta digital</TableColumn>
    //     <TableColumn className="text-center text-base text-black">Alcance</TableColumn>
    //     <TableColumn className="text-center text-base text-black">Visitas</TableColumn>
    //   </TableHeader>
    //   <TableBody>
    //     <TableRow key="1">
    //       <TableCell className="text-center text-black">Static</TableCell>
    //       <TableCell className="text-center text-black"> --- </TableCell>
    //       <TableCell className="text-center text-black"> 250.000 vertices</TableCell>
    //       <TableCell className="text-center text-black"> 500m² - 50.000m²</TableCell>
    //       <TableCell className="text-center text-black"> No </TableCell>
    //       <TableCell className="text-center text-black"> --- </TableCell>
    //       <TableCell className="text-center text-black"> --- </TableCell>
    //     </TableRow>
    //     <TableRow key="1">
    //       <TableCell className="text-center text-black">Static</TableCell>
    //       <TableCell className="text-center text-black"> --- </TableCell>
    //       <TableCell className="text-center text-black"> 250.000 vertices</TableCell>
    //       <TableCell className="text-center text-black"> 500m^2 - 50.000m^2</TableCell>
    //       <TableCell className="text-center text-black"> No </TableCell>
    //       <TableCell className="text-center text-black"> --- </TableCell>
    //       <TableCell className="text-center text-black"> --- </TableCell>
    //     </TableRow>
    //   </TableBody>
    // </Table>
  );
};

export default TablePrices;
