import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GenericTable from "../../../components/GenericTable";
import { careerService } from "../../../services/careerService";
import { semesterService } from "../../../services/semesterService";
import { Career } from "../../../models/Careers/Career";
import { Semester } from "../../../models/Semesters/Semester";

const CareerAndSemesterList: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const tabFromQuery = searchParams.get("tab") === "semesters" ? "semesters" : "careers";
	const [tab, setTab] = useState<"careers" | "semesters">(tabFromQuery);
	const [careerRows, setCareerRows] = useState<Career[]>([]);
	const [semesterRows, setSemesterRows] = useState<Semester[]>([]);

	// Filtros para Carreras
	const [careerSearch, setCareerSearch] = useState("");
	const [careerStatus, setCareerStatus] = useState("all");

	// Filtros para Semestres
	const [semesterSearch, setSemesterSearch] = useState("");
	const [semesterStartDate, setSemesterStartDate] = useState("");
	const [semesterEndDate, setSemesterEndDate] = useState("");

	const fetchCareers = async () => {
		const data = await careerService.getCareers();
        setCareerRows(data);
	};

	const fetchSemesters = async () => {
		const data = await semesterService.getSemesters();
        setSemesterRows(data);
	};

	useEffect(() => {
		fetchCareers();
		fetchSemesters();
	}, []);

	const careerColumns = [
		{ key: "code", label: "Código" },
		{ key: "name", label: "Nombre" },
		{ key: "description", label: "Descripción" },
		{ key: "is_active", label: "Estado" },
	];

	const semesterColumns = [
		{ key: "code", label: "Código" },
		{ key: "name", label: "Nombre" },
		{ key: "start_date", label: "Fecha inicio" },
		{ key: "end_date", label: "Fecha fin" },
		{ key: "is_active", label: "Estado" },
	];

	const actions = [
		{ name: "view", label: "Ver" },
		{ name: "edit", label: "Editar" },
	];

	const handleCareerAction = async (name: string, item: Record<string, any>) => {
		switch (name) {
			case "edit":
				navigate(`/admin/careers/edit/${item.id}`);
				break;
			case "view":
				navigate(`/admin/careers/view/${item.id}`);
				break;
			default:
				break;
		}
	};

	const handleSemesterAction = async (name: string, item: Record<string, any>) => {
		switch (name) {
			case "edit":
				navigate(`/admin/semesters/edit/${item.id}`);
				break;
			case "view":
				navigate(`/admin/semesters/view/${item.id}`);
				break;
			default:
				break;
		}
	};

	const handleTabChange = (nextTab: "careers" | "semesters") => {
		setTab(nextTab);
		setSearchParams({ tab: nextTab });
	};

    
	// Filtrado de Carreras
	const filteredCareers = useMemo(() => {
		return careerRows.filter((career) => {
			const searchLower = careerSearch.toLowerCase();
			const matchesSearch =
				career.code.toLowerCase().includes(searchLower) ||
				career.name.toLowerCase().includes(searchLower) ||
				(career.description || "").toLowerCase().includes(searchLower);
			const matchesStatus =
				careerStatus === "all" || (careerStatus === "active" ? career.is_active : !career.is_active);
			return matchesSearch && matchesStatus;
		});
	}, [careerRows, careerSearch, careerStatus]);

	// Filtrado de Semestres
	const filteredSemesters = useMemo(() => {
		return semesterRows.filter((semester) => {
			const searchLower = semesterSearch.toLowerCase();
			const matchesSearch =
				semester.code.toLowerCase().includes(searchLower) ||
				semester.name.toLowerCase().includes(searchLower);
			const matchesStartDate = !semesterStartDate || new Date(semester.start_date) >= new Date(semesterStartDate);
			const matchesEndDate = !semesterEndDate || new Date(semester.end_date) <= new Date(semesterEndDate);
			return matchesSearch && matchesStartDate && matchesEndDate;
		});
	}, [semesterRows, semesterSearch, semesterStartDate, semesterEndDate]);

	useEffect(() => {
		setTab(tabFromQuery);
	}, [tabFromQuery]);

	return (
		<div className="p-6">
			{/* Tabs */}
			<div className="mb-6 border-b border-gray-200">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => handleTabChange("careers")}
						className={`px-6 py-3 rounded-t-md font-medium transition-colors ${
							tab === "careers"
								? "border-b-4 border-green-600 text-green-700"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						Carreras
					</button>
					<button
						type="button"
						onClick={() => handleTabChange("semesters")}
						className={`px-6 py-3 rounded-t-md font-medium transition-colors ${
							tab === "semesters"
								? "border-b-4 border-green-600 text-green-700"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						Semestres
					</button>
				</div>
			</div>

			{/* Header con Título y Botón */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold text-black dark:text-white">
					{tab === "careers" ? "Carreras" : "Semestres"}
				</h1>
				<button
					type="button"
					onClick={() =>
						tab === "careers"
							? navigate("/admin/careers/create")
							: navigate("/admin/semesters/create")
					}
					className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-green-600 active:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500"
				>
					{tab === "careers" ? "Nueva Carrera" : "Nuevo Semestre"}
				</button>
			</div>

			{/* Sección de Filtros - Carreras */}
			{tab === "careers" && (
				<div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<div className="grid gap-4 md:grid-cols-2">
						{/* Búsqueda de Carreras */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Buscar por código, nombre o descripción
							</label>
							<input
								type="text"
								value={careerSearch}
								onChange={(e) => setCareerSearch(e.target.value)}
								placeholder="Ingrese criterio de búsqueda..."
								className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						{/* Estado de Carreras */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Estado
							</label>
							<select
								value={careerStatus}
								onChange={(e) => setCareerStatus(e.target.value)}
								className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							>
								<option value="all">Todos</option>
								<option value="active">Activo</option>
								<option value="inactive">Inactivo</option>
							</select>
						</div>
					</div>
				</div>
			)}

			{/* Sección de Filtros - Semestres */}
			{tab === "semesters" && (
				<div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<div className="grid gap-4 md:grid-cols-4">
						{/* Búsqueda de Semestres */}
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Buscar por código o nombre
							</label>
							<input
								type="text"
								value={semesterSearch}
								onChange={(e) => setSemesterSearch(e.target.value)}
								placeholder="Ingrese criterio de búsqueda..."
								className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						{/* Fecha Inicio */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Desde
							</label>
							<input
								type="date"
								value={semesterStartDate}
								onChange={(e) => setSemesterStartDate(e.target.value)}
								className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						{/* Fecha Fin */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Hasta
							</label>
							<input
								type="date"
								value={semesterEndDate}
								onChange={(e) => setSemesterEndDate(e.target.value)}
								className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Tabla */}
			<div>
				{tab === "careers" ? (
					<GenericTable
						data={filteredCareers}
						columns={careerColumns}
						actions={actions}
						onAction={handleCareerAction}
					/>
				) : (
					<GenericTable
						data={filteredSemesters}
						columns={semesterColumns}
						actions={actions}
						onAction={handleSemesterAction}
					/>
				)}
			</div>
		</div>
	);
};

export default CareerAndSemesterList;
