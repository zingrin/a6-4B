import type { Category, Subject } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma"


const createCategory = async (data : Category) => {
    return await prisma.category.create({
        data
    })
}
const createSubject = async (data : Subject) => {
    return await prisma.subject.create({
        data
    })
}

const getAllCategories = async () => {
    return await prisma.category.findMany({
        include : {
            subjects : true
        }
    });
}


const updateCategory = async (data : Category, categoryId : string) => {
    return await prisma.category.update({
        where : {
            id : categoryId
        },
        data
    });
}
const updateSubject = async (data : Subject, subjectId : string) => {
    return await prisma.subject.update({
        where : {
            id : subjectId
        },
        data
    });
}

const deleteCategory = async (categoryId : string) => {
    return await prisma.category.delete({
        where : {
            id : categoryId
        }
    });
}

const deleteSubject = async (subjectId : string) => {
    return await prisma.subject.delete({
        where : {
            id : subjectId
        }
    });
}



export const categoryService = {getAllCategories, createCategory, createSubject, updateCategory, updateSubject, deleteCategory, deleteSubject}