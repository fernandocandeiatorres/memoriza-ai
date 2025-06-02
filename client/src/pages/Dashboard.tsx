import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Calendar, User as UserIcon, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface FlashcardSet {
  id: string;
  topic: string;
  created_at: string;
  flashcard_count: number;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);

        // Fetch user's flashcard sets
        await fetchFlashcardSets(session.user.id);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do usuário.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate, toast]);

  const fetchFlashcardSets = async (userId: string) => {
    try {
      // Mock data for now - replace with actual API call
      const mockData: FlashcardSet[] = [
        {
          id: "1",
          topic: "Cardiologia Básica",
          created_at: "2024-01-15T10:30:00Z",
          flashcard_count: 10,
        },
        {
          id: "2",
          topic: "Anatomia do Sistema Nervoso",
          created_at: "2024-01-14T15:45:00Z",
          flashcard_count: 10,
        },
        {
          id: "3",
          topic: "Farmacologia Clínica",
          created_at: "2024-01-13T09:20:00Z",
          flashcard_count: 10,
        },
      ];

      setFlashcardSets(mockData);
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os flashcard sets.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleFlashcardSetClick = (setId: string) => {
    navigate(`/dashboard/flashcard-set/${setId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Profile Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.email || "")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {user.user_metadata?.full_name || "Usuário"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserIcon className="h-4 w-4" />
                  <span>Membro desde {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{flashcardSets.length} conjuntos criados</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flashcard Sets Section */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Meus Flashcard Sets
              </h1>
              <p className="text-gray-600">
                Gerencie e revise seus conjuntos de flashcards criados.
              </p>
            </div>

            {flashcardSets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum flashcard set encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comece criando seu primeiro conjunto de flashcards.
                  </p>
                  <Button
                    onClick={() => navigate("/generator")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Criar Flashcard Set
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {flashcardSets.map((set) => (
                  <Card
                    key={set.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => handleFlashcardSetClick(set.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {set.topic}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4" />
                          <span>{set.flashcard_count} flashcards</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Criado em {formatDate(set.created_at)}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4 bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
