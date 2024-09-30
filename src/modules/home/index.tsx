"use client"

import {
  Book,
  Bot,
  Send,
  Code2,
  Loader2,
  CornerDownLeft,
  LifeBuoy,
  Mic,
  Paperclip,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  SquareUser,
  Triangle,
  ChartNoAxesCombined,
  ArrowDownToLine
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Terminal } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import jsPDF from "jspdf"
import { Input } from "@/components/ui/input"

export default function HomeClient() {

  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [message, setMessage] = useState("" as string)
  const [messages, setMessages] = useState([] as { role: string, content: string }[])

  const [feedbackRole, setFeedbackRole] = useState("teacher")
  const [feedbackName, setFeedbackName] = useState("Nguyễn Hà Công Lý")
  const [feedbackSatis, setFeedbackSatis] = useState("5")
  const [feedbackAccurate, setFeedbackAccurate] = useState("5")

  function handleSend(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer sk-xxxxx");

    const raw = JSON.stringify({
      model: "gpt-4",
      temperature: 0.5,
      stream: true,
      messages: [
        {
          role: "system",
          content: "Bạn là một chuyên gia về toán học xác suất",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const requestOptions: any = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);

    setMessage("");

    fetch("https://api.openai.com/v1/chat/completions", requestOptions)
      .then((response) => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";
        const read = () => {
          reader?.read().then(({ done, value }) => {
            if (done) {
              setLoading(false);
              return;
            }
            const chunk = decoder.decode(value);
            const jsonChunks = chunk
              .split("\n")
              .filter((line) => line.trim() !== "")
              .map((line) => line.replace(/^data: /, ""));
            for (const jsonChunk of jsonChunks) {
              if (jsonChunk === "[DONE]") return;
              try {
                const json = JSON.parse(jsonChunk);
                const content = json.choices[0].delta?.content;
                if (content) {
                  assistantMessage += content;
                  setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    if (lastMessage?.role === "assistant") {
                      return [
                        ...prevMessages.slice(0, -1),
                        { ...lastMessage, content: assistantMessage },
                      ];
                    } else {
                      return [
                        ...prevMessages,
                        { role: "assistant", content: assistantMessage },
                      ];
                    }
                  });
                }
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
            read();
          });
        };
        read();
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  };

  const handleFeedback = () => {
    setLoadingFeedback(true);
    const requestOptions: any = {
      method: "GET",
      redirect: "follow"
    };
    fetch(`https://n8n.com/webhook/xxxxxx?role=${feedbackRole}&name=${feedbackName}&satis=${feedbackSatis}&accurate=${feedbackAccurate}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        setLoadingFeedback(false)
        toast({
          title: "Feedback Thành Công",
          description: "Cảm ơn bạn đã gửi phản hồi.",
          action: (
            <ToastAction altText="Goto schedule to undo">Close</ToastAction>
          ),
        })
      })
      .catch((error) => console.error(error));
  }

  function downloadJSON() {
    return;
    const splitMessages: any = [];
    messages.forEach(message => {
      const parts = message.content.split("\n");
      parts.forEach(part => {
        splitMessages.push({
          role: message.role,
          content: part.trim()
        });
      });
    });
    const jsonContent = JSON.stringify(splitMessages, null, 4);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fmath-output.json";
    link.click();
  }

  const downloadPdf = () => {
    const questions: any = [];
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Danh sách 20 câu hỏi", 10, 10);
    doc.setFontSize(12);
    questions?.forEach((question: any, index: any) => {
      doc.text(`${index + 1}. ${question}`, 10, 20 + index * 10);
    });
    doc.save("20-cau-hoi.pdf");
  };

  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <Triangle className="size-5 fill-foreground" />
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg bg-muted"
                  aria-label="Playground"
                >
                  <SquareTerminal className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Playground
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Models"
                >
                  <Bot className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Models
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="API"
                >
                  <Code2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                API
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Documentation"
                >
                  <Book className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Documentation
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Settings"
                >
                  <Settings2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Help"
                >
                  <LifeBuoy className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Help
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-auto rounded-lg"
                  aria-label="Account"
                >
                  <SquareUser className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Account
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">FMath Playground</h1>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Settings className="size-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Configuration</DrawerTitle>
                <DrawerDescription>
                  Configure the settings for the model and messages.
                </DrawerDescription>
              </DrawerHeader>
              <form
                className="grid w-full items-start gap-6 overflow-auto p-4 pt-0"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFeedback();
                }}
              >
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Settings
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="model">Model</Label>
                    <Select defaultValue="math" onValueChange={() => { }}>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <ChartNoAxesCombined className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                <span className="font-medium text-foreground">
                                  Xác suất thống kê
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                Bài tập về xác suất thống kê.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </fieldset>
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Messages
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="system" onValueChange={() => { }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" value="Bạn là một chuyên gia về toán học xác suất thống kê." onChange={() => { }} />
                  </div>
                </fieldset>
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Feedback
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Chức vụ</Label>
                    <Select defaultValue="teacher" onValueChange={(value: string) => setFeedbackRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Giáo viên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Giáo viên</SelectItem>
                        <SelectItem value="student">Học sinh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Tên</Label>
                    <Textarea
                      id="name"
                      value={feedbackName}
                      onChange={(event) => setFeedbackName(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Độ hài lòng</Label>
                    <Select defaultValue="5" onValueChange={(value: string) => setFeedbackSatis(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rất hài lòng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Rất hài lòng</SelectItem>
                        <SelectItem value="4">Hài lòng</SelectItem>
                        <SelectItem value="3">Bình thường</SelectItem>
                        <SelectItem value="2">Tệ</SelectItem>
                        <SelectItem value="1">Rất tệ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Ghi chú</Label>
                    <Textarea
                      id="name"
                      onChange={(event) => setFeedbackName(event.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="ml-auto gap-1.5"
                    variant="outline"
                  >
                    Hoàn tất
                    {
                      loadingFeedback
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : <Send className="size-3.5" />
                    }
                  </Button>
                </fieldset>
              </form>
            </DrawerContent>
          </Drawer>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="size-3.5" />
            Share
          </Button>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0"
          >
            <form
              className="grid w-full items-start gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleFeedback();
              }}
            >
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Cài đặt
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="model">Loại bài tập</Label>
                  <Select defaultValue="math" onValueChange={() => { }}>
                    <SelectTrigger
                      id="model"
                      className="items-start [&_[data-description]]:hidden"
                    >
                      <SelectValue placeholder="Chọn bài tập" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <ChartNoAxesCombined className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              <span className="font-medium text-foreground">
                                Xác suất thống kê
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              Bài tập về xác suất thống kê.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </fieldset>
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Messages
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="system" onValueChange={() => { }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value="Bạn là một chuyên gia về toán học xác suất thống kê."
                    onChange={() => { }}
                  />
                </div>
              </fieldset>
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Feedback
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="role">Chức vụ</Label>
                  <Select defaultValue="teacher" onValueChange={(value: string) => setFeedbackRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Giáo viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Giáo viên</SelectItem>
                      <SelectItem value="student">Học sinh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="role">Tên</Label>
                  <Input
                    id="name"
                    value={feedbackName}
                    onChange={(event) => setFeedbackName(event.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="role">Độ hài lòng</Label>
                  <Select defaultValue="5" onValueChange={(value: string) => setFeedbackSatis(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rất hài lòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Rất hài lòng</SelectItem>
                      <SelectItem value="4">Hài lòng</SelectItem>
                      <SelectItem value="3">Bình thường</SelectItem>
                      <SelectItem value="2">Tệ</SelectItem>
                      <SelectItem value="1">Rất tệ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="role">Ghi chú</Label>
                  <Textarea
                    id="name"
                    onChange={(event) => setFeedbackName(event.target.value)}
                  />
                </div>
                <Button size="sm" className="ml-auto gap-1.5" variant="outline">
                  Hoàn tất
                  {
                    loadingFeedback
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <Send className="size-3.5" />
                  }
                </Button>
              </fieldset>
            </form>
          </div>
          <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge variant="outline" className="absolute right-3 top-3">
              Output
            </Badge>
            <div className="space-y-4 flex-grow pt-8 pb-20 overflow-y-auto max-h-[calc(100vh-200px)]">
              {messages?.map((msg, index) => (
                <div key={index} className={`w-full flex ${msg.role === "user" ? 'justify-end' : 'justify-start'} items-center`}>
                  <Alert className={`w-2/3 relative ${msg.role === "user" ? 'bg-gray-100' : 'bg-white pb-12'}`}>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>{msg.role === "user" ? 'You' : 'Assistant'}</AlertTitle>
                    <AlertDescription>
                      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {msg.content}
                      </pre>
                    </AlertDescription>
                    {
                      msg.role === "assistant" && (
                        <Button type="submit" size="sm" className="m-0 p-0 pr-5 absolute bottom-1 right-1" onClick={downloadJSON}>
                          Tải về
                          <ArrowDownToLine className="size-3.5 ml-2" />
                        </Button>
                      )
                    }
                  </Alert>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 w-full p-4">
              <form
                className="w-full overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
              >
                <Label htmlFor="message" className="sr-only">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn..."
                  className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center p-3 pt-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Paperclip className="size-4" />
                          <span className="sr-only">Attach file</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Attach File</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Mic className="size-4" />
                          <span className="sr-only">Use Microphone</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Use Microphone</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button type="submit" size="sm" className="ml-auto gap-1.5" onClick={handleSend}>
                    Gửi tin nhắn
                    {
                      loading
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : <CornerDownLeft className="size-3.5" />
                    }
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
