import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GenericTable from "../../../components/GenericTable";

import { Rubric } from "../../../models/Evaluation/Rubric";
import { Evaluation } from "../../../models/Evaluation/Evaluation";

import { rubricService } from "../../../services/rubricService";
import { evaluationService } from "../../../services/evaluationService";
import { enrollmentService } from "../../../services/enrollmentService";
import { userPService } from "../../../services/userPService";

import { LocalStorageProvider } from "../../../storage/LocalStorageProvider";

interface RubricRow extends Rubric {
    evaluationName?: string;
    groupId?: string | number;
}

const Rubrics: React.FC = () => {
    const navigate = useNavigate();

    const [data, setData] = useState<RubricRow[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const storageProvider = new LocalStorageProvider();

            const userInStorage = storageProvider.getParsedItem("user") as {
                id?: string;
            } | null;

            const id = userInStorage?.id;

            if (!id) return;

            // Buscar usuario real
            const users = await userPService.getUsers();

            const user = users.find(
                (u) => u.profile?.id === id || u.id === id
            );

            const profileId = user?.profile?.id ?? id;

            // Obtener enrollments del estudiante
            const enrollments =
                await enrollmentService.getStudentEnrollments(
                    profileId
                );

            // Solo grupos activos
            const activeGroupIds = new Set(
                enrollments
                    .filter(
                        (enrollment) =>
                            enrollment.status === "ACTIVE"
                    )
                    .map((enrollment) =>
                        String(enrollment.group_id)
                    )
            );

            // Obtener evaluaciones y rúbricas
            const [evaluations, rubrics] =
                await Promise.all([
                    evaluationService.getEvaluations(),
                    rubricService.getPublicRubrics(),
                ]);

            // Filtrar evaluaciones donde el estudiante está inscrito
            const studentEvaluations = evaluations.filter(
                (evaluation) =>
                    activeGroupIds.has(
                        String(evaluation.group_id)
                    )
            );

            // Crear lista de rúbricas relacionadas
            const rubricRows: RubricRow[] =
                studentEvaluations
                    .map((evaluation: Evaluation) => {
                        const rubric = rubrics.find(
                            (r) =>
                                String(r.id) ===
                                String(evaluation.rubric_id)
                        );

                        if (!rubric) return null;

                        return {
                            ...rubric,
                            evaluationName:
                                evaluation.name,
                            groupId:
                                evaluation.group_id,
                        };
                    })
                    .filter(
                        (
                            item
                        ): item is RubricRow =>
                            item !== null
                    );

            setData(rubricRows);
        } catch (error) {
            console.error(
                "Error cargando rúbricas:",
                error
            );
        }
    };

    const handleAction = (
        action: string,
        item: RubricRow
    ) => {
        if (action === "view") {
            navigate(
                `/students/evaluations/list`
            );
        }
    };

    return (
        <div>
            <h2 className="mb-4 text-2xl font-semibold">
                Lista de evaluaciones
            </h2>

            <GenericTable
                data={data}
                columns={[
                    {
                        key: "evaluationName",
                        label: "Evaluación",
                    },
                    {
                        key: "title",
                        label: "Rúbrica",
                    },
                    {
                        key: "description",
                        label: "Descripción",
                    },
                ]}
                actions={[
                    {
                        name: "view",
                        label: "Detalles",
                    },
                ]}
                onAction={handleAction}
            />
        </div>
    );
};

export default Rubrics;