import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import SemesterForm from "../../components/SemesterForm";
import { Semester } from "../../models/Semesters/Semester";
import { SemesterPayload } from "../../models/Semesters/SemesterPayload";
import { semesterService } from "../../services/semesterService";

const UpdateSemester = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [semester, setSemester] = useState<Semester | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			if (!id) {
				setLoading(false);
				return;
			}

			const semesterData = await semesterService.getSemesterById(id);

			setSemester(semesterData);
			setLoading(false);
		};

		fetchData();
	}, [id]);

	const handleUpdateSemester = async (values: SemesterPayload) => {
		try {
			if (!semester?.id) {
				throw new Error("ID de semestre no disponible");
			}

			const semesterLabel = semester.name || semester.code || "este semestre";
			const confirmation = await Swal.fire({
				title: "Confirmar actualización",
				text: `¿Seguro que desea guardar los cambios del semestre "${semesterLabel}"?`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Sí, guardar cambios",
				cancelButtonText: "Cancelar",
				reverseButtons: true,
			});

			if (!confirmation.isConfirmed) {
				return;
			}

			const updatedSemester = await semesterService.updateSemester(semester.id, values);

			if (updatedSemester) {
				await Swal.fire({
					title: "Completado",
					text: "Se ha actualizado correctamente el registro",
					icon: "success",
					timer: 3000,
				});
				navigate("/admin/careers-semesters?tab=semesters");
				return;
			}

			throw new Error("No se pudo actualizar el semestre");
		} catch (error) {
			console.error("Error al actualizar semestre:", error);
			Swal.fire({
				title: "Error",
				text: "Existe un problema al momento de actualizar el registro",
				icon: "error",
				timer: 3000,
			});
		}
	};

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
				</div>
			</div>
		);
	}

	return (
		<>
			<Breadcrumb pageName="Editar semestre" />
			<SemesterForm mode={2} semester={semester} onSubmit={handleUpdateSemester} />
		</>
	);
};

export default UpdateSemester;