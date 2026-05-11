import type { NextFunction, Request, Response } from "express"
import { categoryService } from "./category.service"


const createCategory = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await categoryService.createCategory(req.body)

       return res.status(201).json({success : true, message : "Category created successfully", data : result})
    } catch (e) {
       next(e)
    }
}
const createSubject = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await categoryService.createSubject(req.body)

       return res.status(201).json({success : true, message : "Subject created successfully", data : result})
    } catch (e) {
       next(e)
    }
}

const getAllCategories = async (req : Request, res : Response, next : NextFunction) => {
    try { 
        const result = await categoryService.getAllCategories();
        if (result.length < 1) {
            return res.status(200).json({success : true, message : "No categories found", data : []})
        }
       return res.status(200).json({success : true, message : "Categories data retrieved successfully", data : result})
    } catch (e) {
       next(e)
    }
}


const updateCategory = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await categoryService.updateCategory(req.body, req.params.categoryId as string)

       return res.status(200).json({success : true, message : "Category updated successfully", data : result})
    } catch (e) {
       next(e)
    }
}
const updateSubject = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await categoryService.updateSubject(req.body, req.params.subjectId as string)

       return res.status(200).json({success : true, message : "Subject updated successfully", data : result})
    } catch (e) {
       next(e)
    }
}

const deleteCategory = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await categoryService.deleteCategory(req.params.categoryId as string)

       return res.status(200).json({success : true, message : "Category deleted successfully", data : result})
    } catch (e) {
       next(e)
    }
}
const deleteSubject = async (req : Request, res : Response, next : NextFunction) => {
    try {
        const result = await categoryService.deleteSubject(req.params.subjectId as string)

       return res.status(200).json({success : true, message : "Subject deleted successfully", data : result})
    } catch (e) {
       next(e)
    }
}

export const categoryController = {getAllCategories, createCategory, createSubject, updateCategory, updateSubject, deleteCategory, deleteSubject}