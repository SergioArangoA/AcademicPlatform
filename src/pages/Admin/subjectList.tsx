import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GenericTable from "../../components/GenericTable";
import FilterBar, { FilterValues } from "../../components/FilterBar";
import { Subject } from "../../models/Subjects/Subject";
import { subjectService } from "../../services/subjectService";

const initialFilterValues: FilterValues = {
	search: "",
	status: "all",
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const SubjectList = () => {
	const navigate = useNavigate();
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [filters, setFilters] = useState<FilterValues>(initialFilterValues);

	const fetchSubjects = async () => {
		const data = await subjectService.getSubjects();
		setSubjects(data);
	};

	useEffect(() => {
		fetchSubjects();
	}, []);

	const filteredSubjects = useMemo(() => {
		const search = normalizeText(filters.search ?? "");
		const status = filters.status ?? "all";

		return subjects.filter((subject) => {
			const matchesSearch =
				search === "" ||
				[subject.code, subject.name, subject.description]
					.filter(Boolean)
					.join(" ")
					.toLowerCase()
					.includes(search);

			const matchesStatus =
				status === "all" ||
				(status === "active" && subject.is_active) ||
				(status === "inactive" && !subject.is_active);

			return matchesSearch && matchesStatus;
		});
	}, [filters.search, filters.status, subjects]);

	const handleFilterChange = (key: string, value: string) => {
		setFilters((current) => ({
			...current,
			[key]: value,
		}));
	};

	const handleClearFilters = () => {
		setFilters(initialFilterValues);
	};

	const filterConfigs = [
		{
			key: "search",
			label: "Buscar",
			type: "text" as const,
			placeholder: "Buscar por código, nombre o descripción...",
		},
		{
			key: "status",
			label: "Estado",
			type: "select" as const,
			options: [
				{ value: "all", label: "Todos" },
				{ value: "active", label: "Activo" },
				{ value: "inactive", label: "Inactivo" },
			],
		},
	];

	const columns = [
		{ key: "code", label: "Código" },
		{ key: "name", label: "Nombre" },
		{ key: "credits", label: "Créditos" },
		{ key: "description", label: "Descripción" },
		{ key: "is_active", label: "Estado" },
		{ key: "updated_at", label: "Última Actualización"},
	];

	const actions = [
		{ name: "view", label: "Ver" },
		{ name: "edit", label: "Editar" },
		{ name: "delete", label: "Eliminar" },
	];

	const handleAction = async (name: string, item: Record<string, any>) => {
		switch (name) {
			case "view":
				if (!item.id) {
					window.alert("No se pudo identificar la asignatura para verla.");
					return;
				}
				navigate(`/admin/subjects/view/${item.id}`);
				break;
			case "edit":
				if (!item.id) {
					window.alert("No se pudo identificar la asignatura para editarla.");
					return;
				}
				navigate(`/admin/subjects/edit/${item.id}`);
				break;
			case "delete": {
				const subjectId = item.id;

				if (!subjectId) {
					window.alert("No se pudo identificar la materia para eliminarla.");
					return;
				}

				const subjectLabel = item.name || item.code || "esta materia";
				const confirmed = await Swal.fire({
					title: "Confirmar eliminación",
					text: `¿Seguro que desea eliminar la materia "${subjectLabel}"?`,
					icon: "warning",
					showCancelButton: true,
					confirmButtonText: "Sí, eliminar",
					cancelButtonText: "Cancelar",
					reverseButtons: true,
				});

				if (!confirmed.isConfirmed) {
					return;
				}

				const ok = await subjectService.deleteSubject(subjectId);

				if (ok) {
					await fetchSubjects();
					await Swal.fire({
						title: "Completado",
						text: "Materia eliminada correctamente.",
						icon: "success",
						timer: 3000,
					});
				} else {
					await Swal.fire({
						title: "Error",
						text: "No se pudo eliminar la materia.",
						icon: "error",
						timer: 3000,
					});
				}
				break;
			}
			default:
				break;
		}
	};

	return (
		<div className="p-4">
			<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-black dark:text-white">Gestión de Materias</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{filteredSubjects.length} de {subjects.length} materias visibles
					</p>
				</div>

				<button
					type="button"
					onClick={() => navigate("/admin/subjects/create")}
					className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-black shadow-md transition hover:bg-green-700 active:bg-green-800"
				>
					Nueva asignatura
				</button>
			</div>

			<div className="mb-4">
				<FilterBar
					filters={filterConfigs}
					values={filters}
					onChange={handleFilterChange}
					onClear={handleClearFilters}
				/>
			</div>

			<GenericTable
				data={filteredSubjects}
				columns={columns}
				actions={actions}
				onAction={handleAction}
			/>
		</div>
	);
};

export default SubjectList;
