import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/Breadcrumb";
import { Semester } from "../../../models/Semesters/Semester";
import { semesterService } from "../../../services/semesterService";

const formatDateTime = (value: string) => {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return date.toLocaleString();
};

const ViewSemester = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [semester, setSemester] = useState<Semester | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSemester = async () => {
			if (!id) {
				setLoading(false);
				return;
			}

			const data = await semesterService.getSemesterById(id);
			setSemester(data);
			setLoading(false);
		};

		fetchSemester();
	}, [id]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
					<p className="mt-4 text-gray-600">Cargando semestre...</p>
				</div>
			</div>
		);
	}

	if (!semester) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600">No se encontró el semestre solicitado.</p>
					<button
						type="button"
						onClick={() => navigate("/admin/careers-semesters?tab=semesters")}
						className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-black transition hover:bg-green-700"
					>
						Volver
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<Breadcrumb pageName="Ver semestre" />
			<div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
					<h2 className="text-xl font-semibold text-gray-800 dark:text-white">Detalle de semestre</h2>
				</div>

				<div className="grid gap-5 px-6 py-6 md:grid-cols-2">
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">ID</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{semester.id}
						</p>
					</div>
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Código</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{semester.code}
						</p>
					</div>
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{semester.name}
						</p>
					</div>
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{semester.is_active ? "Activo" : "Inactivo"}
						</p>
					</div>
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha inicio</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{formatDateTime(semester.start_date)}
						</p>
					</div>
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha fin</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{formatDateTime(semester.end_date)}
						</p>
					</div>
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha de creación</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{formatDateTime(semester.created_at)}
						</p>
					</div>
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha de actualización</p>
						<p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
							{formatDateTime(semester.updated_at)}
						</p>
					</div>
				</div>

				<div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/40">
					<button
						type="button"
						onClick={() => navigate("/admin/careers-semesters?tab=semesters")}
						className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-green-700"
					>
						Volver
					</button>
				</div>
			</div>
		</>
	);
};

export default ViewSemester;