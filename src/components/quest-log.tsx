"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Check, Circle, Gamepad2, Sparkles } from "lucide-react";

const STORAGE_KEY = "livia-portfolio-quests-v1";

const quests = [
  { id: "sobre", title: "Conhecer a dev", href: "#sobre" },
  { id: "skills", title: "Ver as habilidades", href: "#skills" },
  { id: "projetos", title: "Explorar projetos", href: "#projetos" },
  { id: "contato", title: "Abrir uma conversa", href: "#contato" },
] as const;

type QuestId = (typeof quests)[number]["id"];

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot() {
  return "[]";
}

function getVisited(snapshot: string): Set<QuestId> {
  try {
    const saved: unknown = JSON.parse(snapshot);
    if (!Array.isArray(saved)) return new Set();
    return new Set(
      saved.filter(
        (value): value is QuestId =>
          typeof value === "string" && quests.some((quest) => quest.id === value),
      ),
    );
  } catch (error) {
    console.error("O progresso salvo das missões não pôde ser lido.", error);
    return new Set();
  }
}

function markQuest(id: QuestId) {
  const visited = getVisited(getSnapshot());
  if (visited.has(id)) return false;
  visited.add(id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
  } catch (error) {
    console.error("O progresso da missão não pôde ser salvo.", error);
  }
  listeners.forEach((listener) => listener());
  return true;
}

export function QuestLog() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visited = useMemo(() => getVisited(snapshot), [snapshot]);
  const [announcement, setAnnouncement] = useState("");
  const completedCount = visited.size;
  const progress = Math.round((completedCount / quests.length) * 100);

  useEffect(() => {
    const targets = quests
      .map((quest) => ({
        quest,
        element: document.querySelector<HTMLElement>(`[data-quest-id="${quest.id}"]`),
      }))
      .filter(
        (target): target is { quest: (typeof quests)[number]; element: HTMLElement } =>
          target.element !== null,
      );

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = targets.find((item) => item.element === entry.target);
          if (target && markQuest(target.quest.id)) {
            setAnnouncement(`Missão concluída: ${target.quest.title}. +25 XP`);
            observer.unobserve(target.element);
          }
        });
      },
      { threshold: 0.15 },
    );

    targets.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!announcement) return;
    const timeout = window.setTimeout(() => setAnnouncement(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [announcement]);

  return (
    <aside className="quest-console" aria-label="Perfil da Lívia e missões do portfólio">
      <div className="quest-console-top">
        <span>
          <Gamepad2 size={15} /> FICHA DA DEV
        </span>
        <span className="quest-console-version">SAVE LOCAL</span>
      </div>
      <div className="quest-player">
        <div className="quest-avatar">
          <Image
            src="/assets/img/avatar.svg"
            alt="Avatar ilustrado de um monitor simpático"
            width={82}
            height={82}
          />
          <span className="quest-avatar-level">
            LV. {String(1 + Math.floor(completedCount / quests.length)).padStart(2, "0")}
          </span>
        </div>
        <div>
          <h2>Lívia Pisanello</h2>
          <p>Desenvolvedora full stack</p>
          <span className="quest-class">ENGENHARIA DE SOFTWARE</span>
        </div>
      </div>
      <div className="quest-xp">
        <div className="quest-xp-copy">
          <span>
            <Sparkles size={14} /> TRILHA EXPLORADA
          </span>
          <strong>
            {completedCount}/{quests.length}
          </strong>
        </div>
        <div
          className="quest-xp-track"
          role="progressbar"
          aria-label="Missões do portfólio concluídas"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={quests.length}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>
          {progress} XP <span>· cada seção explorada soma 25 XP</span>
        </p>
      </div>
      <div className="quest-log">
        <p className="quest-log-title">MISSÕES DESTA VISITA</p>
        {quests.map((quest) => {
          const isComplete = visited.has(quest.id);
          return (
            <Link
              className={`quest-row${isComplete ? " quest-row-complete" : ""}`}
              href={quest.href}
              key={quest.id}
            >
              {isComplete ? <Check size={15} /> : <Circle size={15} />}
              <span>{quest.title}</span>
              {isComplete ? (
                <span className="quest-reward">+25 XP</span>
              ) : (
                <ArrowUpRight size={13} />
              )}
            </Link>
          );
        })}
      </div>
      <p className="quest-announcement" aria-live="polite">
        {announcement}
      </p>
    </aside>
  );
}
