# LangGraph Visual Builder - Quick Reference

## 🎯 What We're Building

**One-liner:** n8n for LangGraph - drag-and-drop AI agent workflow builder

## 🗂️ Document Index

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product vision, features, requirements |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Technical architecture, sprint plan |

## ⚡ Quick Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | React + TypeScript | Ecosystem, hiring, stability |
| Graph Library | React Flow | Best-in-class, used by n8n |
| State Management | Zustand | Simple, performant, small |
| Styling | TailwindCSS | Rapid development |
| Code Editor | Monaco | VS Code's editor |
| Backend | Python FastAPI | LangGraph is Python |
| Real-time | WebSockets | Live execution updates |

## 🏃 MVP Timeline

```
Week 1-2: Canvas + Basic Nodes
Week 3-4: Properties Panel + Code Generation  
Week 5-6: Backend + Execution
Week 7-8: Polish + Launch
```

## ✅ MVP Features Checklist

- [ ] Infinite canvas with pan/zoom
- [ ] Drag nodes from palette
- [ ] Connect nodes with edges
- [ ] Configure node properties
- [ ] Generate LangGraph Python code
- [ ] Save/load workflows (localStorage)
- [ ] Templates (Simple, ReAct, Router)
- [ ] Execute graph with visual feedback

## 🚀 Next Steps

1. **Setup Project** - Initialize React + Vite + TypeScript monorepo
2. **Install React Flow** - Get basic canvas working
3. **Create Nodes** - START, END, LLM, TOOL, ROUTER
4. **Build Properties Panel** - Configure nodes
5. **Code Generator** - Output valid LangGraph code

## 💡 Key Insight

Don't try to execute in browser. The execution MUST happen in Python (LangGraph is Python). Frontend is for **design** and **visualization**. Backend handles **execution**.

---

*Start building! 🛠️*
