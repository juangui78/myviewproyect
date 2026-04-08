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
    <section className="w-full glass-card rounded-2xl p-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-[100%] text-left border-collapse">
          <thead>
            <tr>
              <th className="text-primary font-bold p-4 border-b border-gray-700">Plan</th>
              <th className="text-gray-300 p-4 border-b border-gray-700">Actualización</th>
              <th className="text-gray-300 p-4 border-b border-gray-700">Calidad</th>
              <th className="text-gray-300 p-4 border-b border-gray-700">Área</th>
              <th className="text-gray-300 p-4 border-b border-gray-700">Pauta digital</th>
              <th className="text-gray-300 p-4 border-b border-gray-700">Alcance</th>
              <th className="text-gray-300 p-4 border-b border-gray-700">Visitas</th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            <tr className="hover:bg-white/5 transition-colors">
              <td className="font-bold p-4 border-b border-gray-800">Static</td>
              <td className="p-4 border-b border-gray-800 text-gray-500">---</td>
              <td className="p-4 border-b border-gray-800">250.000 vertices</td>
              <td className="p-4 border-b border-gray-800">500m² - 50.000m²</td>
              <td className="p-4 border-b border-gray-800 text-gray-500">No</td>
              <td className="p-4 border-b border-gray-800 text-gray-500">---</td>
              <td className="p-4 border-b border-gray-800 text-gray-500">---</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="font-bold p-4 border-b border-gray-800">Basic</td>
              <td className="p-4 border-b border-gray-800">2 cada 2 meses</td>
              <td className="p-4 border-b border-gray-800">250.000 vertices</td>
              <td className="p-4 border-b border-gray-800">500m² - 50.000m²</td>
              <td className="p-4 border-b border-gray-800 text-gray-500">No</td>
              <td className="p-4 border-b border-gray-800 text-gray-500">---</td>
              <td className="p-4 border-b border-gray-800 text-gray-500">---</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors bg-primary/5">
              <td className="font-bold p-4 border-b border-gray-800 text-primary">Plus</td>
              <td className="p-4 border-b border-gray-800">2 cada 2 meses</td>
              <td className="p-4 border-b border-gray-800">500.000 vertices</td>
              <td className="p-4 border-b border-gray-800">50.000m² - 100.000m²</td>
              <td className="p-4 border-b border-gray-800 text-green-400">Si</td>
              <td className="p-4 border-b border-gray-800">250.000 vistas</td>
              <td className="p-4 border-b border-gray-800">9.500 vistas al modelo</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="font-bold p-4 border-b border-gray-800">Pro</td>
              <td className="p-4 border-b border-gray-800">2 cada 2 meses</td>
              <td className="p-4 border-b border-gray-800">750.000 vertices</td>
              <td className="p-4 border-b border-gray-800">100.000m² - 200.000m²</td>
              <td className="p-4 border-b border-gray-800 text-green-400">Si</td>
              <td className="p-4 border-b border-gray-800">330.000 vistas</td>
              <td className="p-4 border-b border-gray-800">12.000 vistas al modelo</td>
            </tr>
          </tbody>
        </table>
      </div>
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
