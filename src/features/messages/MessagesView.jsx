import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "../../components/common/Icon";
import { SectionHeader } from "../../components/common/SectionHeader";
import { StateLine } from "../../components/common/StateLine";
import { TextArea } from "../../components/common/TextArea";
import { selectAuth } from "../auth/authSlice";
import { setNotice } from "../ui/uiSlice";
import { apiRequest } from "../../services/api";
import { classNames } from "../../utils/classNames";

export function MessagesView() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [contactFilter, setContactFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = (text) => dispatch(setNotice(text));
  const selectedContact = contacts.find((c) => c._id === selectedContactId) || conversations.find(c => c.user._id === selectedContactId)?.user;

  const loadInitialData = async () => {
    try {
      const [contactsData, conversationsData] = await Promise.all([
        apiRequest("/api/users/contacts", { token: auth.token }),
        apiRequest("/api/messages/conversations", { token: auth.token })
      ]);
      setContacts(contactsData);
      setConversations(conversationsData);
    } catch (error) {
      notify(error.message);
    }
  };

  const searchContacts = async (q) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/api/users/contacts?q=${encodeURIComponent(q)}`, { token: auth.token });
      setContacts(data);
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (contactId = selectedContactId) => {
    if (!contactId) return;
    try {
      setSelectedContactId(contactId);
      setConversation(await apiRequest(`/api/messages/${contactId}`, { token: auth.token }));
    } catch (error) {
      notify(error.message);
    }
  };

  const send = async () => {
    try {
      if (!selectedContactId) {
        notify("Choose a contact first.");
        return;
      }
      if (!message.trim()) return;

      await apiRequest("/api/messages", { token: auth.token, method: "POST", body: { receiverId: selectedContactId, message } });
      setMessage("");
      loadConversation();
      loadInitialData(); // Refresh conversation list
    } catch (error) {
      notify(error.message);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!contactFilter.trim()) {
      loadInitialData();
      return;
    }
    const timer = setTimeout(() => searchContacts(contactFilter), 400);
    return () => clearTimeout(timer);
  }, [contactFilter]);

  return (
    <section className="transition-premium">
      <SectionHeader eyebrow="Direct communication" title="Messages" />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <label className="block">
              <span className="mb-2.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">Find person</span>
              <div className="relative">
                <input
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-10 text-sm font-medium outline-none transition-premium focus:border-[#176f5b] focus:bg-white focus:ring-4 focus:ring-[#176f5b]/5"
                  value={contactFilter}
                  placeholder="Name or email..."
                  onChange={(event) => setContactFilter(event.target.value)}
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="search" />
                </div>
                {loading && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#176f5b]" />
                  </div>
                )}
              </div>
            </label>

            <div className="mt-6 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {contactFilter.trim() ? "Search Results" : "Conversations"}
              </p>

              <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                {(contactFilter.trim() ? contacts : conversations).map((item) => {
                  const contact = contactFilter.trim() ? item : item.user;
                  const isActive = selectedContactId === contact._id;

                  return (
                    <button
                      key={contact._id}
                      onClick={() => loadConversation(contact._id)}
                      className={classNames(
                        "group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-premium",
                        isActive
                          ? "border-[#176f5b] bg-[#e7f4ef] shadow-lg shadow-[#176f5b]/5"
                          : "border-transparent bg-slate-50/50 hover:bg-slate-100/50"
                      )}
                    >
                      <div className={classNames(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-white transition-premium",
                        isActive ? "bg-[#176f5b]" : "bg-slate-300 group-hover:bg-slate-400"
                      )}>
                        {contact.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-black text-slate-900">{contact.name}</span>
                          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-slate-400">{contact.role}</span>
                        </div>
                        <p className="truncate text-xs text-slate-500 font-medium">
                          {contactFilter.trim() ? contact.email : item.latestMessage.message}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {(!contactFilter.trim() && conversations.length === 0) && (
                  <div className="py-10 text-center">
                    <p className="text-xs font-bold text-slate-400">No active conversations</p>
                    <p className="mt-1 text-[10px] text-slate-400">Search for a user to start chatting</p>
                  </div>
                )}

                {(contactFilter.trim() && contacts.length === 0) && (
                  <StateLine text="No matches found" />
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-col min-h-[600px] rounded-3xl border border-slate-200 bg-white shadow-soft overflow-hidden">
          {selectedContact ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-[#176f5b]">
                    <Icon name="user" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight text-slate-950">{selectedContact.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedContact.role} · {selectedContact.email}</p>
                      {conversation.find(m => m.relatedPet) && (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 uppercase tracking-tighter">
                          <Icon name="heart" />
                          Re: {conversation.find(m => m.relatedPet).relatedPet.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-slate-50/30">
                {conversation.map((item) => {
                  const isMe = item.sender === auth.user._id;
                  return (
                    <div key={item._id} className={classNames(
                      "flex w-full",
                      isMe ? "justify-end" : "justify-start"
                    )}>
                      <div className={classNames(
                        "max-w-[75%] rounded-2xl px-5 py-3.5 text-sm font-medium shadow-sm",
                        isMe
                          ? "bg-[#176f5b] text-white rounded-tr-none"
                          : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                      )}>
                        {item.message}
                      </div>
                    </div>
                  );
                })}
                {conversation.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-slate-300">
                    <Icon name="message" />
                    <p className="mt-2 text-sm font-bold">Start a new connection</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 p-6 bg-white">
                <div className="relative flex items-end gap-3">
                  <div className="flex-1">
                    <TextArea
                      placeholder="Type a message..."
                      value={message}
                      onChange={setMessage}
                    />
                  </div>
                  <button
                    onClick={send}
                    disabled={!message.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#176f5b] text-white shadow-lg shadow-[#176f5b]/20 transition-premium hover:bg-[#0f5848] active:scale-95 disabled:opacity-50"
                  >
                    <Icon name="send" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 flex items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <Icon name="message" />
              </div>
              <h3 className="mt-6 text-xl font-black text-slate-900 tracking-tight">Your Inbox</h3>
              <p className="mt-2 max-w-xs text-sm font-medium text-slate-500 leading-relaxed">
                Select a conversation or search for a user to start direct communication.
              </p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
