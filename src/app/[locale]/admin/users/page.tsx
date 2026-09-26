"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  getAdminOrders,
  getAdminUsers,
} from "@/services/api";

import "./users.css";

type Locale = "ar" | "en";

type User = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  role?: string;
  createdAt?: string;
};

type Order = {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
  } | null;
  createdAt?: string;
};

const text = (
  locale: Locale,
  ar: string,
  en: string
) => (locale === "ar" ? ar : en);

const isAdminUser = (user: User) => {
  return (
    user.isAdmin === true ||
    user.role === "admin" ||
    user.role === "Admin"
  );
};

const getEgyptDateParts = (
  dateString?: string
) => {
  if (!dateString) {
    return {
      day: "",
      month: "",
      year: "",
    };
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "",
      month: "",
      year: "",
    };
  }

  const parts = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).formatToParts(date);

  return {
    day:
      parts.find(
        (part) => part.type === "day"
      )?.value || "",
    month:
      parts.find(
        (part) => part.type === "month"
      )?.value || "",
    year:
      parts.find(
        (part) => part.type === "year"
      )?.value || "",
  };
};

const formatEgyptDate = (
  dateString: string | undefined
) => {
  const parts =
    getEgyptDateParts(dateString);

  if (
    !parts.day ||
    !parts.month ||
    !parts.year
  ) {
    return "—";
  }

  return `${parts.day}/${parts.month}/${parts.year}`;
};

const getInitials = (name?: string) => {
  if (!name) return "U";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] || ""}${
    parts[parts.length - 1][0] || ""
  }`.toUpperCase();
};

export default function UsersPage() {
  const locale: Locale =
    typeof window !== "undefined" &&
    window.location.pathname.includes("/en/")
      ? "en"
      : "ar";

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const [users, setUsers] =
    useState<User[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("all");

  const loadData = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [
        usersResponse,
        ordersResponse,
      ] = await Promise.all([
        getAdminUsers(token),
        getAdminOrders(token),
      ]);

      setUsers(
        Array.isArray(usersResponse)
          ? usersResponse
          : usersResponse?.users || []
      );

      setOrders(
        Array.isArray(ordersResponse)
          ? ordersResponse
          : ordersResponse?.orders || []
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : text(
              locale,
              "تعذر تحميل المستخدمين",
              "Unable to load users"
            )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> =
      {};

    orders.forEach((order) => {
      const userId =
        order.user?._id;

      if (!userId) {
        return;
      }

      counts[userId] =
        (counts[userId] || 0) + 1;
    });

    return counts;
  }, [orders]);

  const totalUsers = users.length;

  const adminUsers = users.filter(
    (user) => isAdminUser(user)
  ).length;

  const normalUsers =
    totalUsers - adminUsers;

  const filteredUsers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return users
      .filter((user) => {
        const name =
          user.name || "";

        const email =
          user.email || "";

        const phone =
          user.phone || "";

        const matchesSearch =
          !query ||
          name
            .toLowerCase()
            .includes(query) ||
          email
            .toLowerCase()
            .includes(query) ||
          phone
            .toLowerCase()
            .includes(query);

        const admin =
          isAdminUser(user);

        const matchesRole =
          roleFilter === "all" ||
          (roleFilter === "admin" &&
            admin) ||
          (roleFilter === "user" &&
            !admin);

        return (
          matchesSearch &&
          matchesRole
        );
      })
      .sort((a, b) => {
        const first =
          a.name || a.email || "";

        const second =
          b.name || b.email || "";

        return first.localeCompare(
          second,
          locale === "ar"
            ? "ar"
            : "en"
        );
      });
  }, [
    users,
    search,
    roleFilter,
    locale,
  ]);

  return (
    <main
      className="users-page"
      dir={
        locale === "ar"
          ? "rtl"
          : "ltr"
      }
    >
      <div className="users-container">
        <header className="users-header">
          <div>
            <span className="users-eyebrow">
              TOUCHWOOD ADMIN
            </span>

            <h1>
              {text(
                locale,
                "المستخدمون",
                "Users"
              )}
            </h1>

            <p>
              {text(
                locale,
                "إدارة ومتابعة المستخدمين المسجلين في الموقع.",
                "Manage and monitor registered website users."
              )}
            </p>
          </div>

          <button
            type="button"
            className="users-refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "users-spin"
                  : ""
              }
            />

            {text(
              locale,
              "تحديث",
              "Refresh"
            )}
          </button>
        </header>

        {error ? (
          <section className="users-alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </section>
        ) : null}

        <section className="users-stats">
          <article className="users-stat-card users-stat-total">
            <div className="users-stat-icon">
              <UsersRound size={22} />
            </div>

            <div>
              <span>
                {text(
                  locale,
                  "إجمالي المستخدمين",
                  "Total Users"
                )}
              </span>

              <strong>
                {totalUsers}
              </strong>
            </div>
          </article>

          <article className="users-stat-card users-stat-normal">
            <div className="users-stat-icon">
              <UserRound size={22} />
            </div>

            <div>
              <span>
                {text(
                  locale,
                  "المستخدمون العاديون",
                  "Regular Users"
                )}
              </span>

              <strong>
                {normalUsers}
              </strong>
            </div>
          </article>

          <article className="users-stat-card users-stat-admin">
            <div className="users-stat-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <span>
                {text(
                  locale,
                  "المدراء",
                  "Admins"
                )}
              </span>

              <strong>
                {adminUsers}
              </strong>
            </div>
          </article>
        </section>

        <section className="users-filters">
          <div className="users-search">
            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={text(
                locale,
                "ابحث بالاسم أو البريد الإلكتروني أو الهاتف...",
                "Search by name, email or phone..."
              )}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              {text(
                locale,
                "كل المستخدمين",
                "All Users"
              )}
            </option>

            <option value="user">
              {text(
                locale,
                "مستخدم عادي",
                "Regular User"
              )}
            </option>

            <option value="admin">
              {text(
                locale,
                "أدمن",
                "Admin"
              )}
            </option>
          </select>
        </section>

        <section className="users-summary">
          <strong>
            {filteredUsers.length}
          </strong>

          <span>
            {text(
              locale,
              "مستخدم ظاهر",
              "users shown"
            )}
          </span>
        </section>

        {loading ? (
          <div className="users-loading">
            <Loader2
              size={30}
              className="users-spin"
            />

            <span>
              {text(
                locale,
                "جاري تحميل المستخدمين...",
                "Loading users..."
              )}
            </span>
          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="users-empty">
            <UsersRound size={38} />

            <h3>
              {text(
                locale,
                "لا توجد نتائج",
                "No users found"
              )}
            </h3>

            <p>
              {text(
                locale,
                "جرّب تغيير البحث أو الفلتر.",
                "Try changing the search or filter."
              )}
            </p>
          </div>
        ) : (
          <section className="users-table-card">
            <div className="users-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      {text(
                        locale,
                        "المستخدم",
                        "User"
                      )}
                    </th>

                    <th>
                      {text(
                        locale,
                        "رقم الهاتف",
                        "Phone"
                      )}
                    </th>

                    <th>
                      {text(
                        locale,
                        "البريد الإلكتروني",
                        "Email"
                      )}
                    </th>

                    <th>
                      {text(
                        locale,
                        "عدد الطلبات",
                        "Orders"
                      )}
                    </th>

                    <th>
                      {text(
                        locale,
                        "الدور",
                        "Role"
                      )}
                    </th>

                    <th>
                      {text(
                        locale,
                        "تاريخ التسجيل",
                        "Registration Date"
                      )}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (user) => {
                      const admin =
                        isAdminUser(user);

                      const orderCount =
                        orderCounts[
                          user._id
                        ] || 0;

                      return (
                        <tr
                          key={user._id}
                        >
                          <td>
                            <div className="users-user-cell">
                              <div className="users-avatar">
                                {getInitials(
                                  user.name
                                )}
                              </div>

                              <div className="users-user-info">
                                <strong>
                                  {user.name ||
                                    text(
                                      locale,
                                      "بدون اسم",
                                      "No name"
                                    )}
                                </strong>

                                <small>
                                  ID:{" "}
                                  {user._id.slice(
                                    -6
                                  )}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="users-phone">
                              {user.phone ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            <span className="users-email">
                              {user.email ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            <strong className="users-order-count">
                              {orderCount}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={
                                admin
                                  ? "users-role users-role-admin"
                                  : "users-role users-role-user"
                              }
                            >
                              {admin ? (
                                <>
                                  <ShieldCheck
                                    size={14}
                                  />

                                  {text(
                                    locale,
                                    "أدمن",
                                    "Admin"
                                  )}
                                </>
                              ) : (
                                <>
                                  <UserRound
                                    size={14}
                                  />

                                  {text(
                                    locale,
                                    "مستخدم",
                                    "User"
                                  )}
                                </>
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="users-date">
                              {formatEgyptDate(
                                user.createdAt
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}