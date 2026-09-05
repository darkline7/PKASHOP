import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET quiz details (or check user access)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        sellerId: true,
      },
    });

    if (!product || product.type !== "QUIZ") {
      return NextResponse.json({ error: "Quiz không tồn tại" }, { status: 404 });
    }

    let hasAccess = false;
    let expiresAt: Date | null = null;

    if (user) {
      if (user.id === product.sellerId || user.role === "ADMIN" || product.price === 0) {
        hasAccess = true;
      } else {
        const access = await prisma.quizAccess.findUnique({
          where: { userId_productId: { userId: user.id, productId } },
        });
        if (access && new Date(access.expiresAt) > new Date()) {
          hasAccess = true;
          expiresAt = access.expiresAt;
        }
      }
    }

    if (!hasAccess) {
      // Just return count of questions
      const questionCount = await prisma.quizQuestion.count({ where: { productId } });
      return NextResponse.json({
        hasAccess: false,
        product,
        questionCount,
        message: "Bạn chưa mua quyền làm Quiz này hoặc hạn 7 ngày đã hết.",
      });
    }

    // Return full quiz questions (hide correctAnswer from buyer before submit, or return options)
    const questions = await prisma.quizQuestion.findMany({
      where: { productId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        question: true,
        option1: true,
        option2: true,
        option3: true,
        option4: true,
        order: true,
      },
    });

    return NextResponse.json({
      hasAccess: true,
      product,
      expiresAt,
      questions,
    });
  } catch (error) {
    console.error("Quiz GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST submit quiz answers & calculate score
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const productId = params.id;
    const { answers } = await req.json(); // { [questionId]: selectedOptionNumber }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.type !== "QUIZ") {
      return NextResponse.json({ error: "Quiz không tồn tại" }, { status: 404 });
    }

    // Check access
    let access = null;
    if (user.id !== product.sellerId && user.role !== "ADMIN" && product.price > 0) {
      access = await prisma.quizAccess.findUnique({
        where: { userId_productId: { userId: user.id, productId } },
      });
      if (!access || new Date(access.expiresAt) <= new Date()) {
        return NextResponse.json({ error: "Hạn 7 ngày làm Quiz đã kết thúc" }, { status: 403 });
      }
    }

    const allQuestions = await prisma.quizQuestion.findMany({
      where: { productId },
      orderBy: { order: "asc" },
    });

    let correctCount = 0;
    const detailedResults = allQuestions.map(q => {
      const selected = answers ? Number(answers[q.id]) : null;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        id: q.id,
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
      };
    });

    const totalQuestions = allQuestions.length;
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        productId,
        quizAccessId: access ? access.id : null,
        score: correctCount,
        totalScore: totalQuestions,
        answers: JSON.stringify(answers || {}),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalScore: totalQuestions,
      scorePercent,
      attemptId: attempt.id,
      results: detailedResults,
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}