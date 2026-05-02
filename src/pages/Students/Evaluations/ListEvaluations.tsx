import React, { useEffect, useState } from "react";
import { Evaluation } from "../../../models/Evaluation";
import GenericTable from "../../../components/GenericTable";
import { evaluationService } from "../../../services/evaluationService";
import { useNavigate } from "react-router-dom";

const Evaluations: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Evaluation[]>([]);

    // 🔹 Llamar `fetchData` cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, []);

    // 🔹 Obtiene los datos de los usuarios
    const fetchData = async () => {
        const evaluations = await evaluationService.getEvaluations();
        setData(evaluations);
    };

    const handleAction = (action: string, item: Evaluation) => {
        if (action === "view") {
            console.log("View evaluation:", item);
            navigate(`/Students/evaluation/${item.evaluation_id}`);
        }
    };

    return (
        <div>
            <h2>Lista de evaluaciones</h2>

            <GenericTable
                data={mockEvaluations}
                columns={[
                    {key: "name",label: "Nombre evaluación"},
                    {key: "description", label: "Descripción"},
                    {key: "weight", label: "Peso"}
                    
                ]}
                actions={[
                    { name: "view", label: "Detalles" },
                ]}
                onAction={handleAction}
            />
        </div>
    );
};
const mockEvaluations: Evaluation[] = [
    {
        subject_id: 1,
        group_id: 101,
        name: "Parcial 1",
        description: "Primer examen del semestre",
        weight: 30,
    },
    {
        subject_id: 1,
        group_id: 101,
        name: "Proyecto Final",
        description: "Entrega completa del sistema",
        weight: 50,
    },
];
export default Evaluations;
