import React, { useEffect, useState } from 'react';
import { Evaluation } from '../../../models/Evaluation/Evaluation';
import GenericTable from '../../../components/GenericTable';
import { evaluationService } from '../../../services/evaluationService';
import { enrollmentService } from '../../../services/enrollmentService';
import { LocalStorageProvider } from '../../../storage/LocalStorageProvider';
import { useNavigate } from 'react-router-dom';

/** CU-13: listado de evaluaciones del estudiante (grupos con inscripción activa). */
const Evaluations: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const evaluations = await evaluationService.getEvaluations();
        const storageProvider = new LocalStorageProvider();
        const userInStorage = storageProvider.getParsedItem<{ id?: string; profile?: { id?: string } }>('user');
        const studentId = userInStorage?.profile?.id ?? userInStorage?.id;
        if (!studentId) {
          setData([]);
          return;
        }

        const enrollments = await enrollmentService.getStudentEnrollments(String(studentId));
        const groupIds = new Set(
          enrollments
            .filter((en) => en.status === 'ACTIVE' || en.status === 'Activa')
            .map((en) => String(en.group_id))
        );

        const seen = new Set<string>();
        const userEvaluations: Evaluation[] = [];
        evaluations.forEach((ev) => {
          if (!groupIds.has(String(ev.group_id))) return;
          const id = String(ev.id);
          if (seen.has(id)) return;
          seen.add(id);
          userEvaluations.push(ev);
        });

        setData(userEvaluations);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const handleAction = (action: string, item: Evaluation) => {
    if (action === 'view' && item.id) {
      navigate(`/students/evaluations/${item.id}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mis evaluaciones</h2>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <GenericTable
          data={data}
          columns={[
            { key: 'name', label: 'Nombre evaluación' },
            { key: 'description', label: 'Descripción' },
            { key: 'weight', label: 'Peso (%)' },
          ]}
          actions={[{ name: 'view', label: 'Ver rúbrica' }]}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

export default Evaluations;
