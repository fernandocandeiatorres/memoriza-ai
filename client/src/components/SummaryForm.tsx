import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, Image, File, X, Zap } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  type GenerateFromSummaryRequest,
  generateFromSummarySchema,
} from "@shared/schema";
import { cn } from "@/lib/utils";

interface SummaryFormProps {
  onSubmit: (data: GenerateFromSummaryRequest) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_SIZE_FOR_PROCESSING = 2 * 1024 * 1024; // 2MB para processamento eficiente
const ESTIMATED_TOKENS_PER_PAGE = 2000; // Aproximadamente 2k tokens por página
const MAX_TOKENS_SAFE = 100000; // 100k tokens = ~50 páginas
const ACCEPTED_FILE_TYPES = {
  pdf: ["application/pdf"],
  image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
};

export default function SummaryForm({
  onSubmit,
  isLoading = false,
}: SummaryFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<GenerateFromSummaryRequest>({
    resolver: zodResolver(generateFromSummarySchema),
    defaultValues: {
      content: "",
      contentType: "text",
      difficulty: "intermediate",
      fileName: undefined,
    },
  });

  const contentType = form.watch("contentType");

  // Função para estimar páginas do PDF baseado no tamanho
  const estimatePDFPages = (fileSizeBytes: number): number => {
    // PDF médico típico: ~40-80KB por página
    // Usamos 60KB como média
    return Math.ceil(fileSizeBytes / (60 * 1024));
  };

  // Função para estimar tokens baseado no tamanho do arquivo
  const estimateTokensFromFileSize = (
    fileSizeBytes: number,
    fileType: string
  ): number => {
    if (fileType === "application/pdf") {
      const pages = estimatePDFPages(fileSizeBytes);
      return pages * ESTIMATED_TOKENS_PER_PAGE;
    }
    // Para imagens, base64 aumenta ~33%, então estimamos baseado nisso
    const base64Size = Math.ceil(fileSizeBytes * 1.33);
    return Math.ceil(base64Size / 4); // ~4 chars por token
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        form.setError("content", {
          message: "Arquivo muito grande. Máximo 10MB.",
        });
        return;
      }

      const fileType = file.type;
      let newContentType: "pdf" | "image" | "text" = "text";

      if (ACCEPTED_FILE_TYPES.pdf.includes(fileType)) {
        newContentType = "pdf";

        // Validação específica para PDFs
        const estimatedPages = estimatePDFPages(file.size);
        const estimatedTokens = estimateTokensFromFileSize(file.size, fileType);

        console.log(
          `PDF Info: ${file.size} bytes, ~${estimatedPages} páginas, ~${estimatedTokens} tokens`
        );

        if (file.size > MAX_PDF_SIZE_FOR_PROCESSING) {
          form.setError("content", {
            message: `PDF muito extenso (~${estimatedPages} páginas). Para melhor processamento, use PDFs com até 30-40 páginas ou divida o conteúdo.`,
          });
          return;
        }

        if (estimatedTokens > MAX_TOKENS_SAFE) {
          form.setError("content", {
            message: `PDF pode ser muito longo (~${estimatedPages} páginas, ~${Math.ceil(
              estimatedTokens / 1000
            )}k tokens). Recomendamos PDFs menores para melhor qualidade dos flashcards.`,
          });
          // Permite continuar, mas avisa
          setTimeout(() => {
            form.clearErrors("content");
          }, 7000);
        }
      } else if (ACCEPTED_FILE_TYPES.image.includes(fileType)) {
        newContentType = "image";

        // Validação para imagens
        const estimatedTokens = estimateTokensFromFileSize(file.size, fileType);
        if (estimatedTokens > MAX_TOKENS_SAFE) {
          form.setError("content", {
            message:
              "Imagem muito grande. Use imagens menores ou com menos resolução para melhor processamento.",
          });
          return;
        }
      } else {
        form.setError("content", {
          message:
            "Tipo de arquivo não suportado. Use PDF ou imagens (JPG, PNG, WebP).",
        });
        return;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove o prefixo data:type;base64,
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setUploadedFile(file);
        form.setValue("content", base64);
        form.setValue("contentType", newContentType);
        form.setValue("fileName", file.name);
        form.clearErrors("content");

        // Preview para imagens
        if (newContentType === "image") {
          setFilePreview(URL.createObjectURL(file));
        } else {
          setFilePreview(null);
        }
      } catch (error) {
        form.setError("content", {
          message: "Erro ao processar arquivo.",
        });
      }
    },
    [form]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    form.setValue("content", "");
    form.setValue("contentType", "text");
    form.setValue("fileName", undefined);
  };

  const handleSubmit = (data: GenerateFromSummaryRequest) => {
    if (data.contentType !== "text" && !uploadedFile) {
      form.setError("content", {
        message: "Por favor, faça upload de um arquivo ou cole um texto.",
      });
      return;
    }

    // Validação adicional para conteúdo de texto muito grande
    if (data.contentType === "text") {
      const estimatedTokens = Math.ceil(data.content.length / 4); // ~4 chars por token
      const estimatedPages = Math.ceil(
        estimatedTokens / ESTIMATED_TOKENS_PER_PAGE
      );

      if (estimatedTokens > MAX_TOKENS_SAFE) {
        form.setError("content", {
          message: `Texto muito extenso (~${estimatedPages} páginas, ${Math.ceil(
            estimatedTokens / 1000
          )}k tokens). Para melhor qualidade dos flashcards, use textos menores ou divida o conteúdo.`,
        });
        return;
      }
    }

    onSubmit(data);
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <File className="h-8 w-8 text-red-500" />;
    if (type.includes("image"))
      return <Image className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div id="summary-form">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Tipo de conteúdo */}
          <FormField
            control={form.control}
            name="contentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Tipo de Conteúdo
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conteúdo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="text">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Texto
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center">
                        <Image className="h-4 w-4 mr-2" />
                        Imagem
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de conteúdo baseado no tipo */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  {contentType === "text"
                    ? "Resumo ou Texto"
                    : "Upload de Arquivo"}
                </FormLabel>
                <FormControl>
                  {contentType === "text" ? (
                    <Textarea
                      {...field}
                      placeholder="Cole aqui seu resumo, anotações ou material de estudo..."
                      className="min-h-[200px] resize-none"
                    />
                  ) : (
                    <div className="space-y-4">
                      {!uploadedFile ? (
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                            dragActive
                              ? "border-primary bg-primary/5"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Arraste e solte seu arquivo aqui
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            {contentType === "pdf"
                              ? "Suporte para arquivos PDF (máx. 2MB, ~30-40 páginas recomendado)"
                              : "Suporte para JPG, PNG, WebP (máx. 10MB)"}
                          </p>
                          <input
                            type="file"
                            accept={
                              contentType === "pdf"
                                ? ".pdf"
                                : ".jpg,.jpeg,.png,.webp"
                            }
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("file-upload")?.click()
                            }
                          >
                            Escolher Arquivo
                          </Button>
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getFileIcon(uploadedFile.type)}
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {uploadedFile.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(
                                      2
                                    )}{" "}
                                    MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeFile}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {filePreview && (
                              <div className="mt-4">
                                <img
                                  src={filePreview}
                                  alt="Preview"
                                  className="max-h-40 rounded border"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  {contentType === "text"
                    ? "Cole aqui suas anotações, resumos ou qualquer material de estudo"
                    : contentType === "pdf"
                    ? "PDFs médicos até 2MB (~30-40 páginas) para melhor processamento"
                    : "Imagens com conteúdo educacional (fotos de livros, slides, anotações)"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nível de dificuldade */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Nível de Dificuldade
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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
                <FormDescription className="text-xs text-gray-500">
                  Escolha o nível de dificuldade dos flashcards baseados no seu
                  resumo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-4 rounded-lg font-medium flex justify-center items-center shadow-sm transition-all"
            disabled={isLoading}
          >
            <Zap className="mr-2 h-5 w-5" />
            {isLoading
              ? "Gerando flashcards... (pode demorar para conteúdo extenso)"
              : "Gerar Flashcards do Resumo"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
