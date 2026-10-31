const sendEmail = require("./job");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DB_URL });

const producer = async function (type, payload, delay = 0) {
  await pool.query(
    "insert into jobs (type, payload, run_at) values( $1, $2, now() + ($3 * interval '1 second'))",
    [type, JSON.stringify(payload), delay],
  );
};

const consumer = async function () {
  while (true) {
    const client = await pool.connect();
    console.log("Connection pool is created");
    let job;
    try {
      await client.query("begin");

      const { rows } = await client.query(
        "select * from jobs where status = 'pending' and run_at <= now() order by id limit 1 for update skip locked",
      );

      if (rows.length === 0) {
        await new Promise((resolve, reject) => {
          setTimeout(resolve, 3000);
        });
        continue;
      }

      job = rows[0];

      if (job.type == "send_email") {
        await sendEmail(job.payload.to);
      }
      await client.query(`update jobs set status = 'done' where id = $1`, [
        job.id,
      ]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      console.log(`Error occured... ${error}`);
      console.log("Rolling back...");

      if (job) {
        await pool.query(
          `update jobs set attempts = attempts + 1,
        status = case when attempts + 1 >= 3 then 'failed' else 'pending' end,
        run_at = case when attempts + 1 >= 3 then run_at else now() + interval '5 seconds' end
        where id = $1 `,
          [job.id],
        );
      }
    } finally {
      client.release();
      console.log("Connection is realeased");
    }
  }
};

module.exports = { consumer, producer };
