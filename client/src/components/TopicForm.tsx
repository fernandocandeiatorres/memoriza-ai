import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type GenerateFlashcardsRequest, generateFlashcardsSchema } from "@shared/schema";

interface TopicFormProps {
  onSubmit: (data: GenerateFlashcardsRequest) => void;
  isLoading?: boolean;
}

export default function TopicForm({ onSubmit, isLoading = false }: TopicFormProps) {
  const form = useForm<GenerateFlashcardsRequest>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      topic: "",
      difficulty: "intermediate",
    },
  });

  const handleSubmit = (data: GenerateFlashcardsRequest) => {
    onSubmit(data);
  };

  return (
    <div id="topic-form">
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="bg-white"
        >
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                  Tópico Médico
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-all"
                    placeholder="ex: Cardiologia, Neurologia, Fisiologia Renal"
                  />
                </FormControl>
                <FormDescription className="mt-2 text-xs text-gray-500">
                  Seja específico para melhores resultados. Exemplos: "Arritmias Cardíacas", "Fisiologia Renal"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Dificuldade
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition-all">
                      <SelectValue placeholder="Selecione o nível de dificuldade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Iniciante - Conceitos básicos
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                        Intermediário - Conhecimento médio
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                        Avançado - Nível de residente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="mt-2 text-xs text-gray-500">
                  Escolha o nível de dificuldade dos flashcards que serão gerados.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between mt-8">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-4 rounded-lg font-medium flex justify-center items-center shadow-sm transition-all"
              disabled={isLoading}
            >
              <Zap className="mr-2 h-5 w-5" />
              {isLoading ? "Gerando flashcards..." : "Gerar Flashcards"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
