import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue, Spinner } from "@heroui/table";
import { useState, useEffect } from "react";
import axios from "axios";

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

export default function History({ idProyect, onModelSelect }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await axios.get(`/api/controllers/models_/${idProyect}/allmodels`);
        const data = response.data;
        setModels(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    loadModels();
  }, []);


  const rows = models.map((model) => ({
    key: model._id.toString(),
    name: model.name || 'Sin nombre', 
    date: new Date(model.creation_date || model.createdAt).toLocaleDateString(),
    // Estos son los campos que necesitas para loadModel
    model: {
      url: model.model.url,
      _id: model._id,
      terrains: model.terrains
    }
  }));
  

  return (
    <Table aria-label="Example table with dynamic content" className="py-4 dark" isCompact selectionMode="single">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={rows} className="text-xs text-white">
        {(item, index) => (
          <TableRow key={index} className="text-xs text-white" onClick={() => onModelSelect(item)}>
            {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}