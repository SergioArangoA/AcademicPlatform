import React, { useEffect, useState } from "react";
import { Evaluation } from "../../../models/Evaluation/Evaluation";
import GenericTable from "../../../components/GenericTable";
import { evaluationService } from "../../../services/evaluationService";
import { enrollmentService } from "../../../services/enrollmentService";
import { userPService } from "../../../services/userPService";
import { LocalStorageProvider } from "../../../storage/LocalStorageProvider";
import { useNavigate } from "react-router-dom";

const Evaluations: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Evaluation[]>([]);

    // 🔹 Llamar `fetchData` cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, []);

    // 🔹 Obtiene los datos de las evaluaciones
    const fetchData = async () => {
        const evaluations = await evaluationService.getEvaluations();
        const storageProvider = new LocalStorageProvider();
        const userInStorage = storageProvider.getParsedItem("user");
        
        const id = userInStorage.id;
        const users = await userPService.getUsers();
        const user = users.find((u) => u.profile?.id === id || u.id === id);
        const enrollments = await enrollmentService.getStudentEnrollments(user?.profile?.id);


        const userEvaluations = [];
        enrollments.forEach((en)=>{
            if (en.status === "ACTIVE"){
                const matches = evaluations.filter((ev) => ev.group_id === en.group_id);
                if (matches){
                    userEvaluations.forEach((match) =>{
                        userEvaluations.push(match);
                    });
                }

            }

        })
        setData(userEvaluations);
    };

    const handleAction = (action: string, item: Evaluation) => {
        if (action === "view") {
            console.log("View evaluation:", item);
            navigate(`/students/evaluations/${item.id}`);
        }
    };

    return (
        <div>
            <h2>Lista de evaluaciones</h2>

            <GenericTable
                data={data}
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
        evaluation_id: 1,
        subject_id: 1,
        group_id: 101,
        name: "Parcial 1",
        description: "Primer examen del semestre",
        weight: 30,
    },
    {
        evaluation_id: 2,
        subject_id: 1,
        group_id: 101,
        name: "Proyecto Final",
        description: "Entrega completa del sistema",
        weight: 50,
    },
];
export default Evaluations;
