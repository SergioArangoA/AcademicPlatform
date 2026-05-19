import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../../components/Breadcrumb";
import CareerForm from "../../components/CareerForm";
import { Career } from "../../models/Careers/Career";
import { CareerPayload } from "../../models/Careers/CareerPayload";
import { careerService } from "../../services/careerService";

const UpdateCareer = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [career, setCareer] = useState<Career | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCareer = async () => {
			if (!id) {
				setLoading(false);
				return;
			}

			const careerData = await careerService.getCareerById(id);
			setCareer(careerData);
			setLoading(false);
		};

		fetchCareer();
	}, [id]);

	const handleUpdateCareer = async (values: CareerPayload) => {
		try {
			if (!career?.id) {
				throw new Error("ID de carrera no disponible");
			}

			const careerLabel = career.name || career.code || "esta carrera";
			const confirmation = await Swal.fire({
				title: "Confirmar actualización",
				text: `¿Seguro que desea guardar los cambios de la carrera "${careerLabel}"?`,
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: "Sí, guardar cambios",
				cancelButtonText: "Cancelar",
				reverseButtons: true,
			});

			if (!confirmation.isConfirmed) {
				return;
			}

			const updatedCareer = await careerService.updateCareer(career.id, values);

			if (updatedCareer) {
				await Swal.fire({
					title: "Completado",
					text: "Se ha actualizado correctamente el registro",
					icon: "success",
					timer: 3000,
				});
				navigate("/admin/careers-semesters");
				return;
			}

			throw new Error("No se pudo actualizar la carrera");
		} catch (error) {
			console.error("Error al actualizar carrera:", error);
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
					<p className="mt-4 text-gray-600">Cargando carrera...</p>
				</div>
			</div>
		);
	}

	if (!career) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600">No se encontró la carrera solicitada.</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<Breadcrumb pageName="Editar carrera" />
			<CareerForm mode={2} career={career} onSubmit={handleUpdateCareer} />
		</>
	);
};

export default UpdateCareer;