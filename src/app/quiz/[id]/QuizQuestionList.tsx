"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Components";
import { CheckCircle2, XCircle, RefreshCw, Trophy } from "lucide-react";

export function QuizResultBanner({ result, onReset }: any) {
  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-primary-500/30 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl mx-auto">
        <Trophy className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Kết quả làm bài</h2>
      <div className="text-3xl font-extrabold text-primary-600">
        {result.score} / {result.totalScore} ({result.scorePercent}%)
      </div>
      <p className="text-xs text-muted-foreground">
        {result.scorePercent >= 80 ? "Xuất sắc! Bạn nắm bài rất vững." : result.scorePercent >= 50 ? "Khá tốt! Hãy ôn lại các câu sai bên dưới nhé." : "Cần ôn tập thêm lý thuyết bạn nhé!"}
      </p>
      <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
        <RefreshCw className="w-4 h-4" /> Làm lại bài Quiz
      </Button>
    </Card>
  );
}

export function QuizQuestionList({ questions, answers, result, onSelect }: any) {
  return (
    <div className="space-y-4">
      {questions.map((q: any, index: number) => {
        const selected = answers[q.id];
        return (
          <Card key={q.id} className="p-5 space-y-3">
            <div className="flex items-start gap-2">
              <span className="font-bold text-sm text-primary-600">Câu {index + 1}:</span>
              <p className="font-medium text-sm text-foreground flex-1">{q.question}</p>
            </div>

            <div className="space-y-2 pt-1">
              {[1, 2, 3, 4].map((optNum) => {
                const optText = q[`option${optNum}`];
                if (!optText) return null;

                const isChosen = selected === optNum;
                let optionStyle = "border-border hover:bg-muted/50";

                if (result) {
                  if (optNum === q.correctAnswer) {
                    optionStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold";
                  } else if (isChosen && !q.isCorrect) {
                    optionStyle = "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200";
                  }
                } else if (isChosen) {
                  optionStyle = "border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 font-semibold ring-2 ring-primary-500/20";
                }

                return (
                  <button
                    key={optNum}
                    type="button"
                    disabled={Boolean(result)}
                    onClick={() => onSelect(q.id, optNum)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                  >
                    <span>{optText}</span>
                    {result && optNum === q.correctAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {result && isChosen && !q.isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {result && q.explanation && (
              <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground mt-2">
                💡 <strong>Giải thích:</strong> {q.explanation}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
