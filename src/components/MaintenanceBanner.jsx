export const MaintenanceBanner = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-700 text-white text-center py-6 flex items-center justify-center shadow-lg">
      {/* <span className="mr-4 text-xl">⚠️</span> */}
      <div>
        <h2 className="text-lg font-semibold">⚠️ Scheduled Maintenance</h2>
        <p>Platform will be live to use from {formattedDate}</p>
      </div>
    </div>
  );
};
