/**
 * Calificar estudiante (ruta alternativa /teachers/evaluations/:id/grade).
 * Misma idea que GradeStudentPage pero con layout de breadcrumb; el flujo principal es CU-11 en /evaluaciones/...
 */
import React, { useEffect, useMemo, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumb';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import EvaluationCard from '../../../components/evaluations/EvaluationCard';
import { evaluationService } from '../../../services/evaluationService';
import { subjectService } from '../../../services/subjectService';
import { groupService } from '../../../services/groupService';
import { userService } from '../../../services/userService';
import { rubricService } from '../../../services/rubricService';
import { criterionService } from '../../../services/criterionService';
import { scaleService } from '../../../services/scaleService';
import { enrollmentService } from '../../../services/enrollmentService';
import { gradeService, getGradeErrorMessage } from '../../../services/gradeService';
import { Criterion } from '../../../models/Evaluation/Criterion';
import { Scale } from '../../../models/Evaluation/Scale';
import {
  calculateFinalScoreFromSelections,
  scalesByCriterion,
} from '../../../utils/rubricScoring';

type Selection = { scaleId: string; scaleValue: number; comment: string };

const GradeStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [rubric, setRubric] = useState<any>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [enrollments, setEnrollments] = useState<{ id: string; student_id: string }[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState('');
  const [grades, setGrades] = useState<Record<string, Selection>>({});
  const [observations, setObservations] = useState('');
  const [gradeStatus, setGradeStatus] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const evalData = await evaluationService.getEvaluationById(id);
      if (!evalData?.rubric_id) {
        setLoading(false);
        return;
      }

      const [subjectData, groupData, rubricData, criteriaData, scalesData, enrollmentsData] =
        await Promise.all([
          subjectService.getSubjectById(evalData.subject_id),
          groupService.getGroupById(String(evalData.group_id)),
          rubricService.getRubricById(String(evalData.rubric_id)),
          criterionService.getCriteriaByRubricId(String(evalData.rubric_id)),
          scaleService.getScales(),
          enrollmentService.getEnrollments(String(evalData.group_id)),
        ]);

      const teacherData = groupData?.teacher_id
        ? await userService.getTeacherById(String(groupData.teacher_id))
        : null;

      const criterionIds = criteriaData.map((c) => String(c.id));
      const rubricScales = scalesData.filter((s) =>
        criterionIds.includes(String(s.criterion_id))
      );

      setEvaluation(evalData);
      setSubject(subjectData);
      setGroup(groupData);
      setTeacher(teacherData);
      setRubric(rubricData);
      setCriteria(criteriaData);
      setScales(rubricScales);
      setEnrollments(
        enrollmentsData.map((e) => ({ id: String(e.id), student_id: String(e.student_id) }))
      );
      setLoading(false);
    };
    void load();
  }, [id]);

  useEffect(() => {
    const loadExistingGrade = async () => {
      if (!selectedEnrollment || !evaluation?.rubric_id) return;
      const existing = await gradeService.findGradeForEnrollment(
        selectedEnrollment,
        String(evaluation.rubric_id)
      );
      if (!existing) {
        setGrades({});
        setObservations('');
        setGradeStatus('');
        return;
      }
      setObservations(existing.observations ?? '');
      setGradeStatus(existing.status ?? '');
      const next: Record<string, Selection> = {};
      for (const detail of existing.details ?? []) {
        const scale = scales.find((s) => String(s.id) === String(detail.scale_id));
        if (!scale) continue;
        const criterionId = String(scale.criterion_id);
        next[criterionId] = {
          scaleId: String(detail.scale_id),
          scaleValue: scale.value,
          comment: detail.comment ?? '',
        };
      }
      setGrades(next);
    };
    void loadExistingGrade();
  }, [selectedEnrollment, evaluation?.rubric_id, scales]);

  const finalGrade = useMemo(() => {
    const selections: Record<string, { scaleId: string; scaleValue: number }> = {};
    Object.entries(grades).forEach(([cid, g]) => {
      selections[cid] = { scaleId: g.scaleId, scaleValue: g.scaleValue };
    });
    return calculateFinalScoreFromSelections(criteria, selections);
  }, [grades, criteria]);

  const handleScaleSelect = (criterionId: string, scale: Scale) => {
    setGrades((prev) => ({
      ...prev,
      [criterionId]: {
        scaleId: String(scale.id),
        scaleValue: scale.value,
        comment: prev[criterionId]?.comment ?? '',
      },
    }));
  };

  const handleCommentChange = (criterionId: string, comment: string) => {
    setGrades((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        comment,
        scaleId: prev[criterionId]?.scaleId ?? '',
        scaleValue: prev[criterionId]?.scaleValue ?? 0,
      },
    }));
  };

  const buildDetails = () =>
    Object.values(grades)
      .filter((g) => g.scaleId)
      .map((g) => ({
        scale_id: g.scaleId,
        comment: g.comment?.trim() || undefined,
      }));

  const handleSave = async (send: boolean) => {
    if (!selectedEnrollment || !id) {
      toast.error('Selecciona un estudiante.');
      return;
    }

    if (send) {
      const missing = criteria.filter((c) => !grades[String(c.id)]?.scaleId);
      if (missing.length > 0) {
        toast.error(
          `E1: Faltan criterios por calificar: ${missing.map((c) => c.name).join(', ')}`
        );
        return;
      }
    }

    setSaving(true);
    try {
      const saved = await gradeService.gradeStudent({
        enrollment_id: selectedEnrollment,
        evaluation_id: id,
        status: send ? 'SENT' : 'DRAFT',
        observations: observations.trim() || undefined,
        details: buildDetails(),
      });
      setGradeStatus(saved.status ?? '');
      toast.success(
        send
          ? 'Calificación enviada. El estudiante puede consultarla (CU-13).'
          : 'Borrador guardado. Puedes editarlo más tarde.'
      );
    } catch (err) {
      toast.error(getGradeErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Calificar estudiante" />
        <p className="text-gray-500">Cargando...</p>
      </>
    );
  }

  if (!evaluation?.rubric_id) {
    return (
      <>
        <Breadcrumb pageName="Calificar estudiante" />
        <p className="text-amber-600">
          Esta evaluación no tiene rúbrica asociada. Usa CU-10 para vincular una rúbrica publicada.
        </p>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Calificar estudiante (CU-11)" />

      <div className="flex flex-col gap-6">
        <EvaluationCard
          evaluation={evaluation}
          subject={subject}
          group={group}
          user={teacher}
          rubric={rubric}
        />

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
          <label className="mb-2 block font-semibold text-black dark:text-white">
            Estudiante (inscripción activa)
          </label>
          <select
            className="w-full rounded border border-stroke py-2 px-3 dark:bg-form-input dark:border-strokedark"
            value={selectedEnrollment}
            onChange={(e) => setSelectedEnrollment(e.target.value)}
          >
            <option value="" disabled>
              Seleccione inscripción...
            </option>
            {enrollments.map((e) => (
              <option key={e.id} value={e.id}>
                Inscripción {e.id.slice(0, 8)}… — estudiante {e.student_id.slice(0, 8)}…
              </option>
            ))}
          </select>
          {gradeStatus && (
            <p className="mt-2 text-sm text-gray-500">
              Estado actual: <strong>{gradeStatus}</strong>
              {gradeStatus === 'SENT' && ' — ya fue enviada'}
            </p>
          )}

          {selectedEnrollment && (
            <>
              <h4 className="mt-6 mb-4 text-lg font-bold text-black dark:text-white">
                Rúbrica: {rubric?.title}
              </h4>

              {criteria.map((criterion) => {
                const criterionScales = scalesByCriterion(scales, String(criterion.id));
                const sel = grades[String(criterion.id)];
                return (
                  <div
                    key={criterion.id}
                    className="mb-6 rounded border border-stroke p-4 dark:border-strokedark"
                  >
                    <div className="mb-3 flex justify-between border-b border-stroke pb-2 dark:border-strokedark">
                      <span className="font-semibold text-black dark:text-white">
                        {criterion.name}
                      </span>
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                        Peso {criterion.weight}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      {criterionScales.map((scale) => (
                        <label
                          key={scale.id}
                          className={`flex flex-col items-center p-3 border rounded cursor-pointer ${
                            sel?.scaleId === String(scale.id)
                              ? 'border-primary bg-primary/10'
                              : 'border-stroke dark:border-strokedark'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`crit_${criterion.id}`}
                            className="sr-only"
                            checked={sel?.scaleId === String(scale.id)}
                            onChange={() =>
                              handleScaleSelect(String(criterion.id), scale)
                            }
                          />
                          <span className="font-medium text-sm text-center">{scale.name}</span>
                          <span className="text-primary font-bold text-sm">{scale.value}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Comentario opcional"
                      value={sel?.comment ?? ''}
                      onChange={(e) =>
                        handleCommentChange(String(criterion.id), e.target.value)
                      }
                      className="w-full rounded border border-stroke px-3 py-2 text-sm dark:bg-form-input dark:border-strokedark"
                    />
                  </div>
                );
              })}

              <div className="mt-4 mb-4">
                <label className="text-sm font-medium text-black dark:text-white">
                  Observaciones generales
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="mt-1 w-full rounded border border-stroke px-3 py-2 text-sm dark:bg-form-input dark:border-strokedark"
                />
              </div>

              <div className="flex justify-between items-center rounded border border-stroke p-4 dark:border-strokedark">
                <span className="font-semibold text-black dark:text-white">
                  Nota final calculada
                </span>
                <span
                  className={`text-2xl font-bold ${
                    finalGrade >= 3 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {finalGrade.toFixed(2)}
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                  className="rounded border border-stroke px-5 py-2.5 text-sm dark:border-strokedark"
                >
                  Guardar borrador
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="rounded bg-primary px-5 py-2.5 text-sm font-medium text-white"
                >
                  Enviar calificación
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GradeStudent;
