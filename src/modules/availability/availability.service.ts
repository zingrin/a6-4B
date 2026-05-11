import { AvailabilityStatus, Prisma, type Availability } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"


const createAvailability = async (data: Prisma.AvailabilityCreateInput, tutorId: string) => {
const { day, startTime, endTime } = data;

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Time must be in HH:mm format");
  }

  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }

  const conflict = await prisma.availability.findFirst({
    where: {
      tutorId,
      day,
      status: "AVAILABLE",
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  if (conflict) {
    throw new Error("This time slot overlaps with existing availability");
  }

  return prisma.availability.create({
    data: {
      tutorId,
      day,
      startTime,
      endTime,
    },
  });
};



const getAllAvailabilities = async (tutorId : string) => {
    return await prisma.availability.findMany({
        where : {
            tutorId
        }
    })
}

 
const updateAvailability = async (data: Prisma.AvailabilityCreateInput, tutorId: string, availabilityId : string) => {
    const existing = await prisma.availability.findUnique({
        where: { id: availabilityId, tutorId },
    });

    if (!existing) {
        throw new Error("Availability not found");
    }

    if (existing.tutorId !== tutorId) {
        throw new Error("Not authorized to update this availability");
    }

    if (existing.status === "BOOKED") {
        throw new Error("Cannot modify a booked availability");
    }


    const day = data.day ?? existing.day;
    const startTime = data.startTime ?? existing.startTime;
    const endTime = data.endTime ?? existing.endTime;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new Error("Time must be in HH:mm format");
    }

    if (endTime <= startTime) {
        throw new Error("End time must be after start time");
    }

    const conflict = await prisma.availability.findFirst({
        where: {
        tutorId,
        day,
        status: AvailabilityStatus.AVAILABLE,
        NOT: { id: availabilityId },
        AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
        ],
        },
    });

  if (conflict) {
    throw new Error("This time slot overlaps with existing availability");
  }

  return prisma.availability.update({
    where: { id: availabilityId },
    data: {
      day,
      startTime,
      endTime,
    },
  });
};


const deleteAvailability = async (availabilityId: string, tutorId: string) => {

  const existing = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });

  if (!existing) {
    throw new Error("Availability not found");
  }


  if (existing.tutorId !== tutorId) {
    throw new Error("Not authorized to delete this availability");
  }

  if (existing.status === AvailabilityStatus.BOOKED) {
    throw new Error("Cannot delete a booked availability");
  }

  return prisma.availability.delete({
    where: { id: availabilityId },
  });
};



export const availabilityService = {getAllAvailabilities, createAvailability, updateAvailability, deleteAvailability}