import React, { useEffect, useState } from "react";
import { Rubric } from "../../../models/Evaluation/Rubric";
import GenericTable from "../../../components/GenericTable";
import { rubricService } from "../../../services/rubricService";
import { useNavigate } from "react-router-dom";

const Rubrics: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Rubric[]>([]);

    // 🔹 Llamar `fetchData` cuando el componente se monta
    useEffect(() => {
        fetchData();
    }, []);

    // 🔹 Obtiene los datos de las rúbricas
    const fetchData = async () => {
        const rubrics = await rubricService.getPublicRubrics();
        setData(rubrics);
    };

    const handleAction = (action: string, item: Rubric) => {
        if (action === "view") {
            console.log("View rubric:", item);
            navigate(`/students/evaluations/list`);
        }
    };

    return (
        <div>
            <h2>Lista de rúbricas</h2>

            <GenericTable
                data={data}
                columns={[
                    {key: "title",label: "Nombre rúbrica"},
                    {key: "description", label: "Descripción"},
                    
                ]}
                actions={[
                    { name: "view", label: "Detalles" },
                ]}
                onAction={handleAction}
            />
        </div>
    );
};
//    "data": [
  //      {
    //        "created_at": "2026-04-24T02:56:38.383606",
      //      "description": "Main rubric",
        //    "id": "5d84071e-96cd-4ae8-8141-31a0511f6103",
          //"is_public": false,
            //"subject_id": "589d7dc1-aa2b-402a-adfc-432e0b31fb6c",
            //"title": "Rubric 1",
            //"updated_at": "2026-04-24T02:56:38.383606"
        //}
    //],

export default Rubrics;
